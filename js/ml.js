/* ============================================================================
   ML/ANN LAB · Neural Academic Predictor                          (js/ml.js)
   ----------------------------------------------------------------------------
   A real feed-forward Artificial Neural Network (Multi-Layer Perceptron,
   8 → 16 → 10 → 1, tanh hidden units, linear output) trained with
   mini-batch gradient descent + the Adam optimizer, implemented from scratch
   in vanilla JavaScript so it can train LIVE in the browser.

   • DEEP ENSEMBLE: 5 independently-initialized networks are trained on
     bootstrap samples. The ensemble mean is the prediction; the ensemble
     standard deviation gives an honest CONFIDENCE score (deep-ensemble
     uncertainty estimation).
   • EXPLANATIONS: per-prediction feature contributions are computed with
     occlusion sensitivity (replace one feature with the training mean and
     measure how much the prediction moves).
   • RULES + ANN: hard university rules (the 75% attendance debar limit)
     are enforced on top of the network — a constraint should never have to
     be "learned".

   DATA HONESTY: by default the network is trained on a procedurally
   generated SYNTHETIC dataset whose feature↔grade relationships follow
   well-established education-research findings (attendance, continuous
   assessment and prior GPA are the strongest predictors of final grades).
   It is NOT trained on real IULMS/university records. Predictions for the
   student's own courses use their REAL imported IULMS data as input
   features. Plugging in real historical data (see ml-backend/train.py)
   would improve accuracy — this is stated in the UI as well.

   OPTIONAL VPS BACKEND: if ML_API_URL is set in js/config.js, predictions
   are served by the Python/scikit-learn backend in ml-backend/ (same
   feature schema, same ensemble idea). If the API is unreachable the app
   transparently falls back to this in-browser engine.
   ========================================================================== */

/* ── Feature schema (ORDER MATTERS — must match ml-backend/train.py) ────── */
const ML_FEATURES = [
  { key: 'midterm',    label: 'Midterm score',        fmt: v => Math.round(v * 20) + '/20' },
  { key: 'quizzes',    label: 'Quizzes / assignments', fmt: v => Math.round(v * 10) + '/10' },
  { key: 'project',    label: 'Project marks',         fmt: v => Math.round(v * 10) + '/10' },
  { key: 'attendance', label: 'Attendance',            fmt: v => Math.round(v * 100) + '%' },
  { key: 'cgpa',       label: 'Prior CGPA',            fmt: v => (v * 4).toFixed(2) },
  { key: 'credits',    label: 'Credit hours',          fmt: v => Math.round(v * 4) + ' cr' },
  { key: 'isLab',      label: 'Lab course',            fmt: v => (v > 0.5 ? 'yes' : 'no') },
  { key: 'level',      label: 'Course level',          fmt: v => Math.round(v * 400) + '-level' },
];

const ML_CONFIG = {
  hidden: [16, 10],
  ensemble: 5,
  epochs: 60,
  batch: 32,
  lr: 0.012,
  samples: 1400,
  valSplit: 250,
};

/* ── Seeded RNG + Gaussian noise (reproducible training) ─────────────────── */
function _mlMulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function _mlRandn(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function _mlClamp01(x) { return Math.max(0, Math.min(1, x)); }

/* ── Synthetic dataset generator (education-research-informed) ───────────── */
function mlGenerateDataset(n, seed) {
  const rng = _mlMulberry32(seed);
  const X = [], Y = [];
  for (let i = 0; i < n; i++) {
    /* latent student ability ties the features together realistically */
    const ability = _mlClamp01(0.60 + 0.16 * _mlRandn(rng));
    const cgpa = _mlClamp01(ability + 0.08 * _mlRandn(rng));
    const attendance = _mlClamp01(0.55 + 0.45 * _mlClamp01(ability + 0.25 * _mlRandn(rng)));
    const midterm = _mlClamp01(0.72 * ability + 0.18 * attendance + 0.12 * _mlRandn(rng));
    const quizzes = _mlClamp01(0.65 * ability + 0.20 * attendance + 0.15 * _mlRandn(rng));
    const project = _mlClamp01(0.60 * ability + 0.40 * rng());
    const level = [0.25, 0.5, 0.75, 1][Math.floor(rng() * 4)];
    const isLab = rng() < 0.25 ? 1 : 0;
    const credits = isLab ? 0.25 : 0.75;

    /* grade points 0..4: continuous assessment + attendance + prior GPA,
       harder upper-level courses, labs slightly more forgiving */
    let gp = 4 * _mlClamp01(
      0.40 * midterm + 0.12 * quizzes + 0.06 * project +
      0.20 * attendance + 0.16 * cgpa + 0.06 * isLab
      - 0.10 * (level - 0.25) + 0.07 * _mlRandn(rng)
    );
    /* hard rule region: chronically low attendance collapses the grade
       (mirrors the university's 75% debar policy) */
    if (attendance < 0.70) gp = Math.min(gp, 4 * attendance * 0.62);

    X.push(Float64Array.from([midterm, quizzes, project, attendance, cgpa, credits, isLab, level]));
    Y.push(Math.max(0, Math.min(4, gp)));
  }
  return { X, Y };
}

/* ── MLP: init / forward / backprop with Adam ────────────────────────────── */
function mlMakeNet(sizes, rng) {
  const L = [];
  for (let i = 0; i < sizes.length - 1; i++) {
    const inn = sizes[i], out = sizes[i + 1];
    const W = new Float64Array(inn * out), b = new Float64Array(out);
    const s = Math.sqrt(2 / (inn + out));            /* Xavier init */
    for (let j = 0; j < W.length; j++) W[j] = _mlRandn(rng) * s;
    L.push({
      W, b, inn, out,
      mW: new Float64Array(inn * out), vW: new Float64Array(inn * out),
      mB: new Float64Array(out), vB: new Float64Array(out),
    });
  }
  return { L, t: 0 };
}

function mlForward(net, x) {
  const acts = [x];
  let a = x;
  for (let li = 0; li < net.L.length; li++) {
    const l = net.L[li];
    const z = new Float64Array(l.out);
    const last = li === net.L.length - 1;
    for (let o = 0; o < l.out; o++) {
      let s = l.b[o];
      for (let i = 0; i < l.inn; i++) s += a[i] * l.W[i * l.out + o];
      z[o] = last ? s : Math.tanh(s);
    }
    acts.push(z); a = z;
  }
  return acts;
}

function mlTrainBatch(net, X, Y, idxs, lr) {
  const grads = net.L.map(l => ({ gW: new Float64Array(l.W.length), gB: new Float64Array(l.out) }));
  let loss = 0;
  for (const k of idxs) {
    const acts = mlForward(net, X[k]);
    const out = acts[acts.length - 1][0];
    const err = out - Y[k];
    loss += err * err;
    let delta = [err];                                /* dL/dz at linear output */
    for (let li = net.L.length - 1; li >= 0; li--) {
      const l = net.L[li], aPrev = acts[li];
      const nd = new Float64Array(l.inn);
      for (let o = 0; o < l.out; o++) {
        const d = delta[o];
        grads[li].gB[o] += d;
        for (let i = 0; i < l.inn; i++) {
          grads[li].gW[i * l.out + o] += aPrev[i] * d;
          nd[i] += l.W[i * l.out + o] * d;
        }
      }
      if (li > 0) for (let i = 0; i < l.inn; i++) { const a = acts[li][i]; nd[i] *= (1 - a * a); }
      delta = nd;
    }
  }
  /* Adam update */
  net.t++;
  const b1 = 0.9, b2 = 0.999, eps = 1e-8, n = idxs.length;
  for (let li = 0; li < net.L.length; li++) {
    const l = net.L[li], g = grads[li];
    for (let j = 0; j < l.W.length; j++) {
      const gr = g.gW[j] / n;
      l.mW[j] = b1 * l.mW[j] + (1 - b1) * gr;
      l.vW[j] = b2 * l.vW[j] + (1 - b2) * gr * gr;
      l.W[j] -= lr * (l.mW[j] / (1 - Math.pow(b1, net.t))) / (Math.sqrt(l.vW[j] / (1 - Math.pow(b2, net.t))) + eps);
    }
    for (let o = 0; o < l.out; o++) {
      const gr = g.gB[o] / n;
      l.mB[o] = b1 * l.mB[o] + (1 - b1) * gr;
      l.vB[o] = b2 * l.vB[o] + (1 - b2) * gr * gr;
      l.b[o] -= lr * (l.mB[o] / (1 - Math.pow(b1, net.t))) / (Math.sqrt(l.vB[o] / (1 - Math.pow(b2, net.t))) + eps);
    }
  }
  return loss / n;
}

/* ── Engine state ─────────────────────────────────────────────────────────── */
const MLEngine = {
  ensemble: [],
  norm: null,            /* { mu:[], sd:[] } from training set */
  featMeans: null,       /* raw training-set feature means (for occlusion) */
  valMAE: null,
  trained: false,
  engine: 'browser',     /* 'browser' | 'vps' */
  apiInfo: null,
};

function mlNormalize(x) {
  const n = MLEngine.norm, out = new Float64Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = (x[i] - n.mu[i]) / n.sd[i];
  return out;
}

/* ── Training (chunked so the UI can animate real progress) ──────────────── */
function mlTrain(onProgress) {
  return new Promise((resolve) => {
    const cfg = ML_CONFIG;
    const data = mlGenerateDataset(cfg.samples, 20260612);
    const nVal = cfg.valSplit, nTrain = data.X.length - nVal;
    const Xtr = data.X.slice(0, nTrain), Ytr = data.Y.slice(0, nTrain);
    const Xva = data.X.slice(nTrain), Yva = data.Y.slice(nTrain);

    /* standardize on the training split */
    const dim = Xtr[0].length;
    const mu = new Float64Array(dim), sd = new Float64Array(dim);
    for (const x of Xtr) for (let i = 0; i < dim; i++) mu[i] += x[i] / nTrain;
    for (const x of Xtr) for (let i = 0; i < dim; i++) sd[i] += (x[i] - mu[i]) ** 2 / nTrain;
    for (let i = 0; i < dim; i++) sd[i] = Math.sqrt(sd[i]) || 1;
    MLEngine.norm = { mu: Array.from(mu), sd: Array.from(sd) };
    MLEngine.featMeans = Array.from(mu);
    const XtrN = Xtr.map(mlNormalize), XvaN = Xva.map(mlNormalize);

    MLEngine.ensemble = [];
    const sizes = [dim, ...cfg.hidden, 1];
    const totalEpochs = cfg.ensemble * cfg.epochs;
    let member = 0, epoch = 0, net = null, rng = null, order = null;

    function startMember() {
      rng = _mlMulberry32(1000 + member * 77);
      net = mlMakeNet(sizes, rng);
      /* bootstrap sample indices for ensemble diversity */
      order = [];
      for (let i = 0; i < nTrain; i++) order.push(Math.floor(rng() * nTrain));
      epoch = 0;
    }
    startMember();

    function tick() {
      /* run a few real epochs per animation frame */
      let lastLoss = 0;
      for (let e = 0; e < 3 && epoch < cfg.epochs; e++, epoch++) {
        /* shuffle */
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          const t = order[i]; order[i] = order[j]; order[j] = t;
        }
        for (let s = 0; s < order.length; s += cfg.batch) {
          lastLoss = mlTrainBatch(net, XtrN, Ytr, order.slice(s, s + cfg.batch), cfg.lr);
        }
      }
      const done = member * cfg.epochs + epoch;
      if (onProgress) onProgress({
        progress: Math.round(100 * done / totalEpochs),
        member: member + 1, members: cfg.ensemble,
        epoch, epochs: cfg.epochs,
        loss: lastLoss,
      });
      if (epoch >= cfg.epochs) {
        MLEngine.ensemble.push(net);
        member++;
        if (member >= cfg.ensemble) {
          /* validation MAE over the ensemble */
          let mae = 0;
          for (let i = 0; i < XvaN.length; i++) {
            let m = 0;
            for (const nn of MLEngine.ensemble) m += mlForward(nn, XvaN[i]).slice(-1)[0][0];
            mae += Math.abs(m / MLEngine.ensemble.length - Yva[i]);
          }
          MLEngine.valMAE = mae / XvaN.length;
          MLEngine.trained = true;
          resolve({ valMAE: MLEngine.valMAE });
          return;
        }
        startMember();
      }
      setTimeout(tick, 16);
    }
    setTimeout(tick, 30);
  });
}

/* ── Local prediction (ensemble mean ± std) ──────────────────────────────── */
function mlPredictRaw(featArr) {
  const x = mlNormalize(featArr);
  const preds = MLEngine.ensemble.map(net => {
    const out = mlForward(net, x).slice(-1)[0][0];
    return Math.max(0, Math.min(4, out));
  });
  const mean = preds.reduce((a, b) => a + b, 0) / preds.length;
  const varr = preds.reduce((a, b) => a + (b - mean) ** 2, 0) / preds.length;
  return { gp: mean, std: Math.sqrt(varr), members: preds };
}

/* occlusion-sensitivity explanation: how much does each feature move the
   prediction compared to an "average student" value for that feature */
function mlExplain(featArr) {
  const base = mlPredictRaw(featArr).gp;
  const contributions = [];
  for (let i = 0; i < featArr.length; i++) {
    const x2 = Float64Array.from(featArr);
    x2[i] = MLEngine.featMeans[i];
    const delta = base - mlPredictRaw(x2).gp;
    contributions.push({
      key: ML_FEATURES[i].key,
      label: ML_FEATURES[i].label,
      value: ML_FEATURES[i].fmt(featArr[i]),
      delta,
    });
  }
  contributions.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  return contributions;
}

function mlGradeFromPoints(gp) {
  if (gp >= 3.75) return 'A';
  if (gp >= 3.25) return 'B+';
  if (gp >= 2.75) return 'B';
  if (gp >= 2.25) return 'C+';
  if (gp >= 1.75) return 'C';
  if (gp >= 1.25) return 'D+';
  if (gp >= 0.75) return 'D';
  return 'F';
}

/* ── Build the 8 features for one in-progress course from REAL state ─────── */
function mlBuildFeatures(course, ctx) {
  const nameUp = (course.name || '').toUpperCase();
  const codeUp = (course.code || '').toUpperCase();

  /* midterm / quizzes / project from the imported ExamResultMid data */
  let mid = null, quiz = null, proj = null;
  let rawMid = null, rawQuiz = null, rawProj = null;
  let midtermTotal = 20;

  {
    const m = findMatchingCourseItem(course, ctx.midterms, x => x.name, x => x.code);
    if (m) {
      /* IULMS shows 0 until a component is actually marked — treat 0 as
         "not yet marked" and impute, instead of punishing the student */
      if (m.obtained != null && m.obtained > 0) {
        mid = _mlClamp01(m.obtained / (m.total || 20));
        rawMid = m.obtained;
        midtermTotal = m.total || 20;
      }
      if (m.quizzes != null && m.quizzes > 0) {
        quiz = _mlClamp01(m.quizzes / 10);
        rawQuiz = m.quizzes;
      }
      if (m.project != null && m.project > 0) {
        proj = _mlClamp01(m.project / 10);
        rawProj = m.project;
      }
    }
  }
  /* attendance from the imported StudentAttendance data */
  let att = null;
  {
    const a = findMatchingCourseItem(course, ctx.attendance, x => (x.course || '').replace(/\s*\(\d+\)\s*$/, ''), null);
    if (a && a.totalSessions > 0) att = _mlClamp01(a.present / a.totalSessions);
  }
  const cgpa = ctx.cgpa != null ? _mlClamp01(ctx.cgpa / 4) : 0.65;
  const credits = _mlClamp01((course.credits || 3) / 4);
  const isLab = course.isLab || /-L$/.test(codeUp) || /\(LAB\)/.test(nameUp) ? 1 : 0;
  const digits = (codeUp.match(/(\d{3})/) || [])[1];
  const level = digits ? _mlClamp01(parseInt(digits[0], 10) / 4) : 0.5;

  const missing = [];
  if (mid == null) { mid = 0.55; missing.push('midterm'); }
  if (quiz == null) { quiz = mid * 0.9; missing.push('quizzes'); }
  if (proj == null) { proj = 0.5; missing.push('project'); }
  if (att == null) { att = 0.85; missing.push('attendance'); }

  return {
    arr: Float64Array.from([mid, quiz, proj, att, cgpa, credits, isLab, level]),
    attendancePct: att, missing,
    rawMid, rawQuiz, rawProj, midtermTotal
  };
}

/* ── Full per-course prediction (rules + ANN + uncertainty + explanation) ── */
function mlPredictCourse(course, ctx) {
  const f = mlBuildFeatures(course, ctx);
  const raw = mlPredictRaw(f.arr);

  const overallCGPA = ctx.cgpa != null ? ctx.cgpa : 2.5;
  const relatedGPA = typeof getRelatedCoursePerformance === 'function'
    ? getRelatedCoursePerformance(course, ctx.transcript || [], overallCGPA)
    : overallCGPA;

  // Blend 80% ANN prediction with 20% related GPA for enhanced accuracy
  const finalGP = 0.8 * raw.gp + 0.2 * relatedGPA;

  let conf = Math.max(0.45, Math.min(0.97, 1 - raw.std / 1.1));
  /* widen uncertainty when inputs had to be assumed */
  conf -= 0.06 * f.missing.length;
  conf = Math.max(0.4, conf);

  const pFail = raw.members.filter(p => p < 2.0).length / raw.members.length;
  const debar = f.attendancePct <= 0.75;   /* hard university rule */
  let risk = 'safe';
  if (debar || finalGP < 2.0 || pFail >= 0.5) risk = 'high';
  else if (finalGP < 2.4 || pFail >= 0.3 || f.attendancePct < 0.80) risk = 'watch';

  return {
    code: course.code, name: course.name, credits: course.credits || 3,
    gp: finalGP, std: raw.std,
    letter: mlGradeFromPoints(finalGP),
    low: mlGradeFromPoints(Math.max(0, finalGP - raw.std)),
    high: mlGradeFromPoints(Math.min(4, finalGP + raw.std)),
    confidence: Math.round(conf * 100),
    pFail: Math.round(pFail * 100),
    risk, debar,
    attendancePct: Math.round(f.attendancePct * 100),
    missing: f.missing,
    factors: mlExplain(f.arr).slice(0, 4),
    features: Array.from(f.arr),
    rawMid: f.rawMid,
    rawQuiz: f.rawQuiz,
    rawProj: f.rawProj,
    midtermTotal: f.midtermTotal,
    relatedGPA
  };
}

/* ── Collect everything the tab needs from app state ─────────────────────── */
function mlCoursesFromState(st) {
  return (st.courses || []).filter(c => c.status === 'inProgress');
}

function mlPredictAllLocal(st) {
  const cgpa = st.transcriptGPA != null ? st.transcriptGPA
    : (typeof computeTranscriptStats === 'function' && st.transcript && st.transcript.length
      ? computeTranscriptStats(st.transcript).cgpaRaw : null);
  const ctx = { midterms: st.midterms, attendance: st.attendance, cgpa, transcript: st.transcript };
  const courses = mlCoursesFromState(st).map(c => mlPredictCourse(c, ctx));

  /* credit-weighted semester GPA prediction */
  let sgpa = null, sgpaStd = 0;
  if (courses.length) {
    const totCr = courses.reduce((a, c) => a + c.credits, 0);
    sgpa = courses.reduce((a, c) => a + c.gp * c.credits, 0) / totCr;
    sgpaStd = Math.sqrt(courses.reduce((a, c) => a + ((c.std * c.credits) / totCr) ** 2, 0));
  }
  /* projected CGPA after this semester */
  let projCgpa = null;
  const done = (st.profile && st.profile.creditsCompleted) || 0;
  if (sgpa != null && cgpa != null && done > 0) {
    const semCr = courses.reduce((a, c) => a + c.credits, 0);
    projCgpa = (done * cgpa + semCr * sgpa) / (done + semCr);
  }
  return {
    engine: MLEngine.engine,
    valMAE: MLEngine.valMAE,
    courses, sgpa, sgpaStd, projCgpa, cgpa,
    riskCounts: {
      high: courses.filter(c => c.risk === 'high').length,
      watch: courses.filter(c => c.risk === 'watch').length,
      safe: courses.filter(c => c.risk === 'safe').length,
    },
  };
}

/* ── Optional Hostinger-VPS backend (ml-backend/) ────────────────────────── */
function mlApiUrl() {
  return (typeof ML_API_URL !== 'undefined' && ML_API_URL) ? ML_API_URL.replace(/\/$/, '') : '';
}

async function mlApiHealth() {
  const url = mlApiUrl();
  if (!url) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(url + '/health', { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) { return null; }
}

async function mlPredictAll(st) {
  const url = mlApiUrl();
  if (url) {
    try {
      const local = mlPredictAllLocal(st);            /* features built locally */
      const rows = local.courses.map(c => ({ features: c.features }));
      if (rows.length) {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch(url + '/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rows }),
          signal: ctrl.signal,
        });
        clearTimeout(t);
        if (r.ok) {
          const data = await r.json();
          if (data && data.predictions && data.predictions.length === rows.length) {
            data.predictions.forEach((p, i) => {
              const c = local.courses[i];
              const overallCGPA = local.cgpa != null ? local.cgpa : 2.5;
              const relatedGPA = typeof getRelatedCoursePerformance === 'function'
                ? getRelatedCoursePerformance(c, st.transcript || [], overallCGPA)
                : overallCGPA;
              // Blend 80% VPS ANN prediction with 20% related GPA for enhanced accuracy
              const blendedGP = 0.8 * p.gp + 0.2 * relatedGPA;
              c.gp = blendedGP; c.std = p.std;
              c.letter = mlGradeFromPoints(blendedGP);
              c.low = mlGradeFromPoints(Math.max(0, blendedGP - p.std));
              c.high = mlGradeFromPoints(Math.min(4, blendedGP + p.std));
              c.confidence = Math.max(40, Math.min(97, Math.round((1 - p.std / 1.1) * 100) - 6 * c.missing.length));
            });
            /* recompute aggregates with API numbers */
            const totCr = local.courses.reduce((a, c) => a + c.credits, 0) || 1;
            local.sgpa = local.courses.length ? local.courses.reduce((a, c) => a + c.gp * c.credits, 0) / totCr : null;
            local.engine = 'vps';
            local.valMAE = data.valMAE != null ? data.valMAE : local.valMAE;
            MLEngine.engine = 'vps';
            _mlLog('ML: predictions served by VPS API', url);
            return local;
          }
        }
      }
      _mlLog('ML: VPS API not usable — falling back to in-browser ANN');
    } catch (e) {
      _mlLog('ML: VPS API unreachable (' + e.message + ') — falling back to in-browser ANN');
    }
  }
  MLEngine.engine = 'browser';
  return mlPredictAllLocal(st);
}

/* what-if simulator: predict from manually adjusted features */
function mlWhatIf(featArr) {
  const raw = mlPredictRaw(Float64Array.from(featArr));
  return {
    gp: raw.gp, std: raw.std,
    letter: mlGradeFromPoints(raw.gp),
    confidence: Math.round(Math.max(0.45, Math.min(0.97, 1 - raw.std / 1.1)) * 100),
  };
}

function _mlLog(){ try { (typeof iuspLog === 'function' ? iuspLog : console.log).apply(null, arguments); } catch (e) { } }

/* Node test hook */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MLEngine, ML_FEATURES, ML_CONFIG, mlGenerateDataset, mlTrain, mlPredictRaw, mlPredictCourse, mlPredictAllLocal, mlBuildFeatures, mlGradeFromPoints, mlExplain, mlWhatIf };
}

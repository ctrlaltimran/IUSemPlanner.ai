"""
IUSemPlanner ML/ANN backend — training script
=============================================
Trains a 5-member deep ensemble of scikit-learn MLPRegressors (feed-forward
ANNs) on the SAME feature schema and the SAME education-research-informed
synthetic data generator as the in-browser engine (js/ml.js), so the frontend
and backend are interchangeable.

Feature order (must never change without updating js/ml.js):
  0 midterm    (0..1, marks/20)
  1 quizzes    (0..1, marks/10)
  2 project    (0..1, marks/10)
  3 attendance (0..1, present/total)
  4 cgpa       (0..1, CGPA/4)
  5 credits    (0..1, credits/4)
  6 isLab      (0 or 1)
  7 level      (0..1, course level/400)
Target: final grade points (0..4).

Usage:
  python train.py                       # train on synthetic data (default)
  python train.py --csv real_data.csv   # train on REAL historical data
                                        # (columns: the 8 features + 'gp')

HONESTY: the default dataset is synthetic. Only claim real-data training if
you actually pass --csv with genuine historical records.
"""
import argparse, json, os
import numpy as np
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib

FEATURES = ["midterm", "quizzes", "project", "attendance", "cgpa", "credits", "isLab", "level"]
OUT_DIR = os.path.join(os.path.dirname(__file__), "models")


def clamp01(x):
    return np.clip(x, 0, 1)


def generate_synthetic(n=1400, seed=20260612):
    """Identical generative process to mlGenerateDataset() in js/ml.js."""
    rng = np.random.default_rng(seed)
    ability = clamp01(0.60 + 0.16 * rng.standard_normal(n))
    cgpa = clamp01(ability + 0.08 * rng.standard_normal(n))
    attendance = clamp01(0.55 + 0.45 * clamp01(ability + 0.25 * rng.standard_normal(n)))
    midterm = clamp01(0.72 * ability + 0.18 * attendance + 0.12 * rng.standard_normal(n))
    quizzes = clamp01(0.65 * ability + 0.20 * attendance + 0.15 * rng.standard_normal(n))
    project = clamp01(0.60 * ability + 0.40 * rng.random(n))
    level = rng.choice([0.25, 0.5, 0.75, 1.0], size=n)
    is_lab = (rng.random(n) < 0.25).astype(float)
    credits = np.where(is_lab > 0, 0.25, 0.75)

    gp = 4 * clamp01(
        0.40 * midterm + 0.12 * quizzes + 0.06 * project
        + 0.20 * attendance + 0.16 * cgpa + 0.06 * is_lab
        - 0.10 * (level - 0.25) + 0.07 * rng.standard_normal(n)
    )
    # hard attendance-debar region (university rule mirrored in the data)
    gp = np.where(attendance < 0.70, np.minimum(gp, 4 * attendance * 0.62), gp)
    gp = np.clip(gp, 0, 4)

    X = np.column_stack([midterm, quizzes, project, attendance, cgpa, credits, is_lab, level])
    return X, gp


def load_csv(path):
    import csv
    X, y = [], []
    with open(path) as f:
        for row in csv.DictReader(f):
            X.append([float(row[c]) for c in FEATURES])
            y.append(float(row["gp"]))
    return np.array(X), np.array(y)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", help="path to real historical data CSV (8 feature cols + gp)")
    ap.add_argument("--members", type=int, default=5)
    args = ap.parse_args()

    if args.csv:
        X, y = load_csv(args.csv)
        data_source = f"real CSV ({args.csv}, n={len(y)})"
    else:
        X, y = generate_synthetic()
        data_source = f"synthetic education-research-informed (n={len(y)})"

    Xtr, Xva, ytr, yva = train_test_split(X, y, test_size=0.18, random_state=7)
    scaler = StandardScaler().fit(Xtr)
    XtrS, XvaS = scaler.transform(Xtr), scaler.transform(Xva)

    os.makedirs(OUT_DIR, exist_ok=True)
    models, preds = [], []
    for seed in range(args.members):
        # bootstrap sample per member → ensemble diversity
        rng = np.random.default_rng(seed)
        idx = rng.integers(0, len(XtrS), len(XtrS))
        net = MLPRegressor(hidden_layer_sizes=(16, 10), activation="tanh",
                           solver="adam", learning_rate_init=0.012,
                           max_iter=600, random_state=seed)
        net.fit(XtrS[idx], ytr[idx])
        models.append(net)
        preds.append(np.clip(net.predict(XvaS), 0, 4))
        print(f"  member {seed + 1}/{args.members} trained")

    ens = np.mean(preds, axis=0)
    val_mae = float(mean_absolute_error(yva, ens))
    print(f"ensemble validation MAE: {val_mae:.3f} grade points")

    joblib.dump(models, os.path.join(OUT_DIR, "ensemble.joblib"))
    joblib.dump(scaler, os.path.join(OUT_DIR, "scaler.joblib"))
    meta = {
        "features": FEATURES,
        "valMAE": val_mae,
        "members": args.members,
        "architecture": "MLP 8-16-10-1 (tanh) x%d deep ensemble" % args.members,
        "data_source": data_source,
        "feature_means": [float(m) for m in Xtr.mean(axis=0)],
    }
    with open(os.path.join(OUT_DIR, "meta.json"), "w") as f:
        json.dump(meta, f, indent=2)
    print("saved models →", OUT_DIR)


if __name__ == "__main__":
    main()

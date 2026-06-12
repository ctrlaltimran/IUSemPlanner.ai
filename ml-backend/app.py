"""
IUSemPlanner ML/ANN backend — FastAPI prediction service (Hostinger VPS)
========================================================================
Endpoints:
  GET  /health   → { ok, engine, valMAE, architecture, data_source }
  POST /predict  → { rows: [ { features: [8 floats] }, ... ] }
                 ← { predictions: [ { gp, std } ], valMAE }

The feature schema matches js/ml.js exactly. The frontend (ML_API_URL in
js/config.js) calls this service and falls back to its in-browser ANN if
this server is unreachable — so the site never breaks.

Run locally:   uvicorn app:app --host 0.0.0.0 --port 8800
"""
import json, os
import numpy as np
import joblib
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BASE = os.path.dirname(__file__)
MODELS_DIR = os.path.join(BASE, "models")

app = FastAPI(title="IUSemPlanner ML/ANN API", version="1.0")

# CORS: by default open so the WordPress-hosted frontend can call the VPS.
# Tighten via env var, e.g. IUSP_CORS="https://ctrlaltimran.com"
origins = os.environ.get("IUSP_CORS", "*").split(",")
app.add_middleware(CORSMiddleware, allow_origins=origins,
                   allow_methods=["*"], allow_headers=["*"])

_models, _scaler, _meta = None, None, {}


def _load():
    global _models, _scaler, _meta
    if _models is None:
        if not os.path.exists(os.path.join(MODELS_DIR, "ensemble.joblib")):
            # first boot on the VPS: train automatically (synthetic data)
            import subprocess, sys
            subprocess.run([sys.executable, os.path.join(BASE, "train.py")], check=True)
        _models = joblib.load(os.path.join(MODELS_DIR, "ensemble.joblib"))
        _scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.joblib"))
        with open(os.path.join(MODELS_DIR, "meta.json")) as f:
            _meta = json.load(f)
    return _models, _scaler, _meta


class PredictRows(BaseModel):
    rows: list


@app.get("/health")
def health():
    _, _, meta = _load()
    return {"ok": True, "engine": "vps",
            "valMAE": meta.get("valMAE"),
            "architecture": meta.get("architecture"),
            "data_source": meta.get("data_source")}


@app.post("/predict")
def predict(body: PredictRows):
    models, scaler, meta = _load()
    X = np.array([r["features"] for r in body.rows], dtype=float)
    Xs = scaler.transform(X)
    member_preds = np.stack([np.clip(m.predict(Xs), 0, 4) for m in models])
    mean = member_preds.mean(axis=0)
    std = member_preds.std(axis=0)
    return {
        "predictions": [{"gp": float(m), "std": float(s)} for m, s in zip(mean, std)],
        "valMAE": meta.get("valMAE"),
    }

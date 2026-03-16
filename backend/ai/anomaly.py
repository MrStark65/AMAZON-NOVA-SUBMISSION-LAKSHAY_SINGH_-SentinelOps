"""
Failure Prediction — Local ML Models
- Isolation Forest: anomaly detection on current metrics
- Heuristic LSTM-style trend scoring: failure probability from metric history
- Facebook Prophet: time-series forecasting (optional, install prophet separately)
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any


# ── Isolation Forest ──────────────────────────────────────────────────────────

def detect_anomalies(nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Detect anomalous nodes using Isolation Forest on [cpu, memory, disk].
    Returns nodes flagged as anomalous.
    """
    if not nodes:
        return []

    features = np.array([[n["cpu"], n["memory"], n["disk"]] for n in nodes])
    model = IsolationForest(contamination=0.2, random_state=42)
    preds = model.fit_predict(features)
    scores = model.score_samples(features)

    return [
        {**node, "anomaly_score": round(float(score), 4), "anomaly": True}
        for node, pred, score in zip(nodes, preds, scores)
        if pred == -1
    ]


# ── Failure Probability ───────────────────────────────────────────────────────

def predict_failure_probability(cpu: float, memory: float, disk: float) -> float:
    """
    Weighted heuristic failure probability (0–100).
    Memory is weighted highest — most common cause of service crashes.
    """
    score = (cpu * 0.30) + (memory * 0.50) + (disk * 0.20)
    # Non-linear amplification at high utilization
    if score > 80:
        score = min(score * 1.15, 99)
    elif score > 70:
        score = score * 1.08
    return round(score, 1)


# ── Trend-based Prediction (LSTM-style heuristic) ────────────────────────────

def predict_trend(metric_history: List[float], window: int = 4) -> Dict[str, Any]:
    """
    Analyze metric trend over recent history.
    Returns: trend direction, rate of change, and estimated time-to-threshold.
    """
    if len(metric_history) < 2:
        return {"trend": "stable", "rate": 0.0, "eta_hours": None}

    recent = metric_history[-window:]
    deltas = [recent[i + 1] - recent[i] for i in range(len(recent) - 1)]
    avg_rate = np.mean(deltas)  # avg change per interval

    current = recent[-1]
    threshold = 90.0

    if avg_rate > 0 and current < threshold:
        intervals_to_threshold = (threshold - current) / avg_rate
        # Assume each interval = 2 hours (matches our demo dataset)
        eta_hours = round(intervals_to_threshold * 2, 1)
    else:
        eta_hours = None

    trend = "rising" if avg_rate > 1 else "falling" if avg_rate < -1 else "stable"

    return {
        "trend": trend,
        "rate": round(float(avg_rate), 2),
        "current": current,
        "eta_hours": eta_hours,
    }


# ── Prophet Forecast (optional) ──────────────────────────────────────────────

def prophet_forecast(timestamps: List[str], values: List[float], periods: int = 6) -> List[float]:
    """
    Time-series forecast using Facebook Prophet.
    Falls back to linear extrapolation if Prophet is not installed.
    """
    try:
        from prophet import Prophet  # type: ignore
        import pandas as pd

        df = pd.DataFrame({"ds": pd.to_datetime(timestamps), "y": values})
        m = Prophet(yearly_seasonality=False, weekly_seasonality=False, daily_seasonality=True)
        m.fit(df)
        future = m.make_future_dataframe(periods=periods, freq="2h")
        forecast = m.predict(future)
        return forecast["yhat"].tail(periods).tolist()

    except ImportError:
        # Linear extrapolation fallback
        if len(values) < 2:
            return [values[-1]] * periods
        rate = (values[-1] - values[-2])
        return [min(values[-1] + rate * (i + 1), 100) for i in range(periods)]

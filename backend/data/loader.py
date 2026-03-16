"""
Loads demo datasets from the /data directory.
In production this would connect to real cloud APIs (AWS CloudWatch, Datadog, etc.)
"""
import json
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent.parent / "data"


def load_metrics():
    with open(DATA_DIR / "metrics.json") as f:
        return json.load(f)


def load_logs():
    with open(DATA_DIR / "logs.json") as f:
        return json.load(f)


def load_security():
    with open(DATA_DIR / "security.json") as f:
        return json.load(f)


def load_costs():
    with open(DATA_DIR / "costs.json") as f:
        return json.load(f)

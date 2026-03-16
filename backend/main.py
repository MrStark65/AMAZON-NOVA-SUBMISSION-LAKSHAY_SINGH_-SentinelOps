"""
SentinelOps AI — FastAPI Backend
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import json
import os

load_dotenv()

# ── Reset demo state on every startup ────────────────────────────────────────
STATE_FILE = Path(__file__).parent.parent / "data" / "agent_state.json"
DEFAULT_STATE = {"fixed_tasks": [], "fixed_nodes": [], "fixed_risks": [], "agent_log": []}
STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
with open(STATE_FILE, "w") as f:
    json.dump(DEFAULT_STATE, f, indent=2)
# ─────────────────────────────────────────────────────────────────────────────

from api.routes import router

app = FastAPI(
    title="SentinelOps AI",
    description="Autonomous Cloud Risk, Cost & Failure Prediction API",
    version="1.0.0",
)

# Allow both local dev and deployed Vercel frontend
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://*.vercel.app",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten after deployment by setting FRONTEND_URL env var
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "sentinelops-ai"}

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from data.loader import load_metrics, load_logs, load_security, load_costs
from data.demo_state import get_state, reset_state
from ai.anomaly import predict_failure_probability, detect_anomalies, predict_trend
from ai.llm import chat
from ai.summarizer import summarize_scan, summarize_cost_waste
from ai.log_analyzer import analyze_logs
from ai.security_analyzer import analyze_security_risks
from ai.embeddings import index_logs, search as vector_search
from ai.voice import voice_query
from ai.agent import run_agent_task, suggest_agent_tasks

router = APIRouter(prefix="/api")


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    top_k: int = 3


class VoiceRequest(BaseModel):
    question: str
    infra_context: Optional[str] = ""


class AgentRequest(BaseModel):
    task_type: str
    context: Optional[dict] = {}


@router.post("/scan")
async def run_scan():
    """
    Full infrastructure scan:
    - Isolation Forest anomaly detection
    - Failure probability per node
    - Claude Haiku security enrichment
    - Nova Lite dashboard summary
    - Log indexing for vector search
    """
    metrics_data = load_metrics()
    security_data = load_security()
    costs_data    = load_costs()
    logs_data     = load_logs()

    # Load demo state — apply any agent fixes
    demo = get_state()
    fixed_nodes = set(demo.get("fixed_nodes", []))
    fixed_risks = set(demo.get("fixed_risks", []))
    fixed_tasks = set(demo.get("fixed_tasks", []))

    nodes   = metrics_data["nodes"]
    history = metrics_data["metrics_history"]

    # Apply node fixes from agent actions
    for node in nodes:
        if node["id"] in fixed_nodes:
            node["status"]  = "healthy"
            node["cpu"]     = max(node["cpu"] - 45, 12)
            node["memory"]  = max(node["memory"] - 40, 18)

    # Apply security fixes
    risks = [r for r in security_data["risks"] if r["id"] not in fixed_risks]

    # ── Failure predictions ──────────────────────────────────────────────────
    predictions = []
    for node in nodes:
        if node["status"] in ("warning", "critical"):
            prob = predict_failure_probability(node["cpu"], node["memory"], node["disk"])
            severity = "critical" if prob >= 75 else "high" if prob >= 55 else "medium"

            top_metric = max({"cpu": node["cpu"], "memory": node["memory"], "disk": node["disk"]}, key=lambda k: {"cpu": node["cpu"], "memory": node["memory"], "disk": node["disk"]}[k])
            reasons = {
                "cpu":    f"CPU at {node['cpu']}% — sustained high load",
                "memory": f"Memory at {node['memory']}% — possible memory leak",
                "disk":   f"Disk at {node['disk']}% — approaching capacity",
            }
            hours = max(1, round((100 - prob) / 10))
            predictions.append({
                "service": node["name"],
                "probability": prob,
                "estimatedFailure": f"~{hours} hours",
                "reason": reasons[top_metric],
                "severity": severity,
            })

    predictions.sort(key=lambda x: x["probability"], reverse=True)

    # ── Trend analysis on CPU history ────────────────────────────────────────
    cpu_history = [m["cpu"] for m in history]
    trend = predict_trend(cpu_history)

    # ── Security enrichment (Nova 2 Lite) ────────────────────────────────────
    try:
        enriched_risks = await analyze_security_risks(risks)
    except Exception:
        enriched_risks = risks

    # ── Summary ──────────────────────────────────────────────────────────────
    status_counts = {"healthy": 0, "warning": 0, "critical": 0}
    for n in nodes:
        status_counts[n["status"]] += 1

    total_waste    = sum(c["monthlyCost"] for c in costs_data["waste"])
    critical_risks = sum(1 for r in enriched_risks if r["severity"] == "critical")

    summary = {
        "healthyNodes":  status_counts["healthy"],
        "warningNodes":  status_counts["warning"],
        "criticalNodes": status_counts["critical"],
        "totalWaste":    total_waste,
        "criticalRisks": critical_risks,
    }

    # ── AI dashboard summary (Nova 2 Lite) ───────────────────────────────────
    try:
        ai_summary = await summarize_scan(summary, predictions, enriched_risks)
    except Exception:
        ai_summary = f"Scan complete. {status_counts['critical']} critical node(s) detected. Monthly waste: ${total_waste}."

    # ── Index logs for vector search ─────────────────────────────────────────
    try:
        await index_logs(logs_data["logs"])
    except Exception:
        pass

    return {
        "nodes":          nodes,
        "predictions":    predictions,
        "costWaste":      costs_data["waste"],
        "securityRisks":  enriched_risks,
        "metrics":        history,
        "trend":          trend,
        "aiSummary":      ai_summary,
        "agentLog":       demo.get("agent_log", []),
        "fixedTasks":     list(fixed_tasks),
        "summary":        summary,
    }


@router.get("/metrics")
async def get_metrics():
    return load_metrics()["metrics_history"]


@router.post("/logs/analyze")
async def analyze_logs_endpoint():
    """Analyze logs with Claude 3.5 Sonnet."""
    logs_data = load_logs()
    return await analyze_logs(logs_data["logs"])


@router.post("/search")
async def semantic_search(req: SearchRequest):
    """Vector similarity search over indexed logs — Titan Embeddings."""
    results = await vector_search(req.query, req.top_k)
    return {"results": results}


@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """DevOps assistant — Nova Pro."""
    response = await chat(req.message, req.context)
    return {"response": response}


@router.post("/costs/summary")
async def cost_summary():
    """Cost waste summary — Nova 2 Lite."""
    costs_data = load_costs()
    summary = await summarize_cost_waste(costs_data["waste"])
    return {"summary": summary}


@router.post("/voice")
async def voice_endpoint(req: VoiceRequest):
    """Voice query — Nova 2 Lite (answer) + Nova 2 Sonic (speech)."""
    return await voice_query(req.question, req.infra_context or "")


@router.post("/agent/run")
async def agent_run(req: AgentRequest):
    """Execute an automated agent task — Nova Act."""
    return await run_agent_task(req.task_type, req.context or {})


@router.post("/agent/suggest")
async def agent_suggest():
    """Suggest agent tasks based on current scan data — Nova 2 Lite."""
    metrics_data  = load_metrics()
    security_data = load_security()
    costs_data    = load_costs()

    nodes = metrics_data["nodes"]
    predictions = []
    for node in nodes:
        if node["status"] in ("warning", "critical"):
            prob = predict_failure_probability(node["cpu"], node["memory"], node["disk"])
            predictions.append({"service": node["name"], "probability": prob})

    suggestions = await suggest_agent_tasks(predictions, security_data["risks"], costs_data["waste"])
    return {"suggestions": suggestions}


@router.post("/agent/reset")
async def agent_reset():
    """Reset all agent fixes — start fresh demo."""
    reset_state()
    return {"status": "reset", "message": "Demo state cleared. All fixes removed."}

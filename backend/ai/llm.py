"""
Main Reasoning Model — Amazon Nova 2 Lite
Used for: infrastructure analysis, DevOps reasoning, fix generation, AI assistant chat.
"""
import os
import json
from typing import Optional
from .bedrock_client import invoke_nova, NOVA_2_LITE

HAS_BEDROCK = bool(
    os.getenv("AWS_BEARER_TOKEN_BEDROCK", "") not in ("", "paste-your-key-here")
)

SYSTEM_PROMPT = """You are SentinelOps AI, an expert DevOps and cloud infrastructure assistant powered by Amazon Nova.
Analyze infrastructure metrics, logs, and security data to provide actionable insights.
Be concise, technical, and direct. Focus on root causes and specific remediation steps.
Reference specific services and metrics when infrastructure context is provided."""

MOCK_RESPONSES = {
    "slow":     "Memory usage increased 240% after the last deployment on payment-service. JVM heap exhausted (88%) causing frequent GC pauses. Recommend: increase heap to 4GB, audit object retention in the payment loop, restart service immediately.",
    "fail":     "payment-service: 78% crash probability within 4h. ml-inference-server: 67% within 6h. Both show memory exhaustion. Immediate action: restart payment-service, scale ml-inference horizontally.",
    "cost":     "Top waste: (1) Two idle EC2 instances at <3% CPU for 14-21 days — terminate for $420/mo. (2) Staging RDS running 24/7 — schedule off-hours stop for $147/mo. (3) Orphaned NAT gateway — remove for $95/mo. Total recoverable: ~$775/mo.",
    "security": "Critical: (1) Public S3 bucket 'prod-user-uploads' — disable public access now. (2) PostgreSQL 5432 open to 0.0.0.0/0 — restrict to VPC CIDR immediately. Also rotate the Stripe API key in payment-service env vars.",
    "default":  "2 critical nodes (payment-service, ml-inference-server) with memory exhaustion. 2 critical security risks need immediate attention. Monthly waste ~$775. Fix security issues first, then restart failing services.",
}


async def chat(message: str, context: Optional[str] = None) -> str:
    """DevOps assistant chat — Nova 2 Lite."""
    if not HAS_BEDROCK:
        return _mock_response(message)

    system = SYSTEM_PROMPT
    if context:
        try:
            data = json.loads(context)
            s = data.get("summary", {})
            system += (
                f"\n\nLive state: {s.get('healthyNodes')} healthy, "
                f"{s.get('warningNodes')} warning, {s.get('criticalNodes')} critical nodes. "
                f"Monthly waste: ${s.get('totalWaste')}. "
                f"Critical security risks: {s.get('criticalRisks')}."
            )
        except Exception:
            pass

    return await invoke_nova(NOVA_2_LITE, system, message, max_tokens=400)


async def explain_infrastructure(issue: dict) -> str:
    """Root cause analysis and remediation for a node — Nova 2 Lite."""
    if not HAS_BEDROCK:
        return f"High resource usage on {issue.get('name')}. Investigate memory leaks and consider scaling."

    prompt = (
        f"Infrastructure issue:\n"
        f"Service: {issue.get('name')}\n"
        f"CPU: {issue.get('cpu')}%, Memory: {issue.get('memory')}%, Disk: {issue.get('disk')}%\n"
        f"Status: {issue.get('status')}\n\n"
        f"Provide: (1) root cause, (2) immediate fix, (3) long-term recommendation."
    )
    return await invoke_nova(NOVA_2_LITE, SYSTEM_PROMPT, prompt, max_tokens=300)


def _mock_response(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ["slow", "slowdown", "latency", "performance"]):
        return MOCK_RESPONSES["slow"]
    if any(w in msg for w in ["fail", "crash", "down", "next"]):
        return MOCK_RESPONSES["fail"]
    if any(w in msg for w in ["cost", "bill", "waste", "expensive", "money"]):
        return MOCK_RESPONSES["cost"]
    if any(w in msg for w in ["security", "risk", "vulnerability", "breach", "exposed"]):
        return MOCK_RESPONSES["security"]
    return MOCK_RESPONSES["default"]

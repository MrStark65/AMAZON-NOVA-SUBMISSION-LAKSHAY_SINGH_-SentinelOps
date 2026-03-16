"""
Log Analysis — Amazon Nova 2 Lite
Used for: analyzing logs, debugging failures, identifying root causes.
"""
import os
from typing import List
from .bedrock_client import invoke_nova, NOVA_2_LITE

HAS_BEDROCK = bool(
    os.getenv("AWS_BEARER_TOKEN_BEDROCK", "") not in ("", "paste-your-key-here")
)

SYSTEM = """You are an expert SRE analyzing system logs.
Identify error patterns, root causes, and cascading failures.
Output format: (1) Summary, (2) Root cause, (3) Affected services, (4) Recommended fix."""


async def analyze_logs(logs: List[dict]) -> dict:
    """Analyze log entries — Nova 2 Lite."""
    if not HAS_BEDROCK:
        return _mock_log_analysis(logs)

    log_text = "\n".join(
        f"[{l['timestamp']}] [{l['level']}] {l['service']}: {l['message']}"
        for l in logs
    )
    prompt = f"Analyze these system logs and identify issues:\n\n{log_text}"
    response = await invoke_nova(NOVA_2_LITE, SYSTEM, prompt, max_tokens=500)

    return {
        "raw_analysis":       response,
        "log_count":          len(logs),
        "error_count":        sum(1 for l in logs if l["level"] == "ERROR"),
        "warn_count":         sum(1 for l in logs if l["level"] == "WARN"),
        "affected_services":  list({l["service"] for l in logs if l["level"] in ("ERROR", "WARN")}),
    }


def _mock_log_analysis(logs: List[dict]) -> dict:
    errors = [l for l in logs if l["level"] == "ERROR"]
    return {
        "raw_analysis": (
            "Critical memory exhaustion on payment-service and ml-inference-server. "
            "Root cause: JVM heap overflow (OOM at 08:12) and CUDA OOM on ml-inference (09:01). "
            "Cascading effect: connection pool exhaustion on payment-service at 11:03. "
            "Recommendation: Restart both services, increase memory limits, add OOM alerting."
        ),
        "log_count":         len(logs),
        "error_count":       len(errors),
        "warn_count":        sum(1 for l in logs if l["level"] == "WARN"),
        "affected_services": list({l["service"] for l in errors}),
    }

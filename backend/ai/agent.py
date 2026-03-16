"""
AI Agent Automation — Amazon Nova Act
Used for: automated DevOps actions triggered by detected issues.

Example agent tasks:
- Detect idle instance → open AWS console → stop instance → generate report
- Detect public S3 bucket → apply private ACL → notify team
- Detect memory leak → scale service → create incident ticket

Nova Act executes multi-step UI/API workflows autonomously.
"""
import os
from typing import List
from .bedrock_client import invoke_nova_act, invoke_nova, NOVA_2_LITE
from data.demo_state import mark_task_fixed, get_state

HAS_BEDROCK = bool(
    os.getenv("AWS_BEARER_TOKEN_BEDROCK", "") not in ("", "paste-your-key-here")
)

# Predefined agent task templates
AGENT_TASKS = {
    "stop_idle_instance": {
        "task": "Stop idle EC2 instance to reduce cloud costs",
        "steps": [
            "Identify the idle instance ID from cost waste report",
            "Verify instance has been idle for more than 7 days",
            "Create a snapshot backup of the instance",
            "Stop the instance via AWS EC2 API",
            "Generate a cost savings report",
        ],
    },
    "fix_public_bucket": {
        "task": "Remediate public S3 bucket security risk",
        "steps": [
            "Identify the public S3 bucket from security scan",
            "Audit current bucket policy and ACL",
            "Apply private ACL to the bucket",
            "Enable bucket versioning and logging",
            "Generate security remediation report",
        ],
    },
    "restart_failing_service": {
        "task": "Restart service with high crash probability",
        "steps": [
            "Identify the service with highest failure probability",
            "Capture current logs and metrics snapshot",
            "Gracefully drain active connections",
            "Restart the service container",
            "Monitor for 5 minutes and confirm recovery",
        ],
    },
    "scale_memory_service": {
        "task": "Scale up service experiencing memory exhaustion",
        "steps": [
            "Identify service with memory usage above 85%",
            "Check current resource limits and quotas",
            "Increase memory limit by 50%",
            "Deploy updated configuration",
            "Verify memory usage stabilizes below 70%",
        ],
    },
}


async def run_agent_task(task_type: str, context: dict = {}) -> dict:
    """
    Execute an automated agent task via Nova Act.
    Saves the fix to demo state so dashboard reflects it after restart.
    """
    if task_type not in AGENT_TASKS:
        return {"error": f"Unknown task type: {task_type}", "available": list(AGENT_TASKS.keys())}

    template = AGENT_TASKS[task_type]

    if not HAS_BEDROCK:
        result = _mock_agent_result(task_type, template, context)
    else:
        try:
            raw = await invoke_nova_act(template["task"], {**context, "steps": template["steps"]})
            result = {
                "task_type":   task_type,
                "task":        template["task"],
                "status":      raw.get("status", "completed"),
                "steps_taken": raw.get("steps", template["steps"]),
                "output":      raw.get("output", ""),
                "demo_mode":   False,
            }
        except Exception:
            result = _mock_agent_result(task_type, template, context)

    # Persist fix to demo state regardless of mode
    resource_map = {
        "restart_failing_service": "payment-service, ml-inference-server",
        "fix_public_bucket":       "s3://prod-user-uploads, rds-postgres-prod",
        "stop_idle_instance":      "i-0a1b2c3d, i-0e5f6a7b",
        "scale_memory_service":    "payment-service",
    }
    mark_task_fixed(
        task_type,
        resource_map.get(task_type, "unknown"),
        template["task"],
    )

    return result


async def suggest_agent_tasks(predictions: list, risks: list, waste: list) -> List[dict]:
    """
    Use Nova 2 Lite to suggest which agent tasks to run based on scan results.
    Returns prioritized list of recommended automated actions.
    """
    if not HAS_BEDROCK:
        return _mock_task_suggestions(predictions, risks, waste)

    context = (
        f"Predictions: {[p['service'] + ' ' + str(p['probability']) + '%' for p in predictions[:3]]}\n"
        f"Security risks: {[r['title'] for r in risks if r['severity'] == 'critical']}\n"
        f"Cost waste: {[w['resource'] for w in waste[:3]]}\n\n"
        f"Available agent tasks: {list(AGENT_TASKS.keys())}\n"
        f"Suggest which tasks to run in priority order. Return as a JSON list of task_type strings."
    )

    system = "You are a DevOps automation assistant. Suggest automated remediation tasks based on infrastructure issues. Return only a JSON array of task type strings."
    response = await invoke_nova(NOVA_2_LITE, system, context, max_tokens=100)

    try:
        import json, re
        match = re.search(r'\[.*?\]', response, re.DOTALL)
        if match:
            tasks = json.loads(match.group())
            return [{"task_type": t, **AGENT_TASKS[t]} for t in tasks if t in AGENT_TASKS]
    except Exception:
        pass

    return _mock_task_suggestions(predictions, risks, waste)


def _mock_agent_result(task_type: str, template: dict, context: dict) -> dict:
    return {
        "task_type":   task_type,
        "task":        template["task"],
        "status":      "planned",
        "steps_taken": template["steps"],
        "output":      f"Agent task '{template['task']}' planned successfully. Steps ready for execution.",
        "demo_mode":   True,
    }


def _mock_task_suggestions(predictions: list, risks: list, waste: list) -> List[dict]:
    suggestions = []
    if any(p["probability"] > 70 for p in predictions):
        suggestions.append({"task_type": "restart_failing_service", **AGENT_TASKS["restart_failing_service"]})
    if any(r["severity"] == "critical" for r in risks):
        suggestions.append({"task_type": "fix_public_bucket", **AGENT_TASKS["fix_public_bucket"]})
    if waste:
        suggestions.append({"task_type": "stop_idle_instance", **AGENT_TASKS["stop_idle_instance"]})
    return suggestions

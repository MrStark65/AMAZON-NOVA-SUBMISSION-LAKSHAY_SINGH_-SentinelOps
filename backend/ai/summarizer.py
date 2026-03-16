"""
Dashboard AI Summaries — Amazon Nova 2 Lite
Used for: quick summaries, dashboard alerts, short explanations.
"""
import os
from .bedrock_client import invoke_nova, NOVA_2_LITE

HAS_BEDROCK = bool(
    os.getenv("AWS_BEARER_TOKEN_BEDROCK", "") not in ("", "paste-your-key-here")
)

SYSTEM = "You are a concise infrastructure monitoring assistant. Summarize findings in 2-3 sentences max. Be direct and actionable."


async def summarize_scan(summary: dict, predictions: list, risks: list) -> str:
    """Short dashboard summary after scan — Nova 2 Lite."""
    if not HAS_BEDROCK:
        critical = summary.get("criticalNodes", 0)
        waste = summary.get("totalWaste", 0)
        return (
            f"Scan complete. {critical} critical node(s) detected requiring immediate attention. "
            f"Estimated monthly waste: ${waste}. Review failure predictions and security risks."
        )

    top_pred = predictions[0] if predictions else None
    top_risk = next((r for r in risks if r["severity"] == "critical"), None)

    prompt = (
        f"Scan results:\n"
        f"- Nodes: {summary['healthyNodes']} healthy, {summary['warningNodes']} warning, {summary['criticalNodes']} critical\n"
        f"- Monthly waste: ${summary['totalWaste']}\n"
        f"- Critical security risks: {summary['criticalRisks']}\n"
    )
    if top_pred:
        prompt += f"- Top failure: {top_pred['service']} at {top_pred['probability']}% crash probability\n"
    if top_risk:
        prompt += f"- Top security risk: {top_risk['title']}\n"
    prompt += "\nWrite a 2-sentence executive summary with the most urgent action."

    return await invoke_nova(NOVA_2_LITE, SYSTEM, prompt, max_tokens=120)


async def summarize_cost_waste(waste_items: list) -> str:
    """Cost optimization summary — Nova 2 Lite."""
    if not HAS_BEDROCK:
        total = sum(w["monthlyCost"] for w in waste_items)
        return f"Found {len(waste_items)} waste sources totaling ${total}/month. Terminating idle instances yields the highest savings."

    items_text = "\n".join(
        f"- {w['resource']} ({w['type']}): ${w['monthlyCost']}/mo, idle {w['idleDays']} days"
        for w in waste_items
    )
    prompt = f"Cloud cost waste:\n{items_text}\n\nSummarize top 2 actions to reduce cost immediately."
    return await invoke_nova(NOVA_2_LITE, SYSTEM, prompt, max_tokens=100)

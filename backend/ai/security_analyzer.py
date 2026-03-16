"""
Security Configuration Analysis — Amazon Nova 2 Lite
Used for: security risk detection, IAM policy analysis, cloud config checks.
"""
import os
from typing import List
from .bedrock_client import invoke_nova, NOVA_2_LITE

HAS_BEDROCK = bool(
    os.getenv("AWS_BEARER_TOKEN_BEDROCK", "") not in ("", "paste-your-key-here")
)

SYSTEM = """You are a cloud security expert. Analyze security configurations and risks.
For each risk provide a specific 1-line remediation CLI command or console action. Be concise and technical."""


async def analyze_security_risks(risks: List[dict]) -> List[dict]:
    """Enrich each security risk with an AI remediation step — Nova 2 Lite."""
    if not HAS_BEDROCK:
        return _mock_enriched_risks(risks)

    enriched = []
    for risk in risks:
        prompt = (
            f"Security risk — {risk['title']}\n"
            f"Description: {risk['description']}\n"
            f"Resource: {risk['resource']}\n"
            f"Severity: {risk['severity']}\n\n"
            f"Give one specific remediation action (CLI command or console step)."
        )
        try:
            remediation = await invoke_nova(NOVA_2_LITE, SYSTEM, prompt, max_tokens=80)
            enriched.append({**risk, "remediation": remediation.strip()})
        except Exception:
            enriched.append({**risk, "remediation": "Apply least-privilege access controls."})

    return enriched


async def analyze_iam_policy(policy_json: str) -> str:
    """Analyze an IAM policy for security issues — Nova 2 Lite."""
    if not HAS_BEDROCK:
        return "IAM policy contains overly broad permissions. Apply least-privilege and remove wildcard actions."

    prompt = f"Analyze this IAM policy for security issues:\n\n{policy_json}\n\nList risks and specific fixes."
    return await invoke_nova(NOVA_2_LITE, SYSTEM, prompt, max_tokens=300)


def _mock_enriched_risks(risks: List[dict]) -> List[dict]:
    remediations = {
        "sec-001": "aws s3api put-bucket-acl --bucket prod-user-uploads --acl private",
        "sec-002": "aws ec2 revoke-security-group-ingress --group-id sg-xxx --protocol tcp --port 5432 --cidr 0.0.0.0/0",
        "sec-003": "aws iam detach-role-policy --role-name lambda-execution-role --policy-arn arn:aws:iam::aws:policy/AdministratorAccess",
        "sec-004": "aws secretsmanager create-secret --name stripe-api-key --secret-string <value>",
        "sec-005": "aws ec2 modify-volume --volume-id vol-0a1b2c3d4e5f --encrypted",
        "sec-006": "aws ec2 revoke-security-group-ingress --group-id sg-prod-web-servers --protocol tcp --port 22 --cidr 0.0.0.0/0",
    }
    return [{**r, "remediation": remediations.get(r["id"], "Apply security best practices.")} for r in risks]

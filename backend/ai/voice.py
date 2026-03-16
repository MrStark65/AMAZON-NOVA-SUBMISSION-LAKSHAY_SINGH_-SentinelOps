"""
Voice AI — Text response via Nova 2 Lite.
Speech synthesis is handled on the frontend using Web Speech API.
Nova 2 Sonic uses bidirectional WebSocket streaming (not simple HTTP invoke),
so for the hackathon demo we return the text and let the browser speak it.
"""
import os
from .bedrock_client import invoke_nova, NOVA_2_LITE

HAS_BEDROCK = bool(
    os.getenv("AWS_BEARER_TOKEN_BEDROCK", "") not in ("", "paste-your-key-here")
)

VOICE_SYSTEM = """You are SentinelOps voice assistant. Answer DevOps questions in 2-3 sentences max.
Be conversational but precise. No markdown, no bullet points — your response will be spoken aloud."""


async def voice_query(question: str, infra_context: str = "") -> dict:
    """Generate a spoken answer for a voice query."""
    system = VOICE_SYSTEM
    if infra_context:
        system += f"\n\nInfrastructure context: {infra_context}"

    if not HAS_BEDROCK:
        text = _mock_voice_response(question)
    else:
        try:
            text = await invoke_nova(NOVA_2_LITE, system, question, max_tokens=150)
        except Exception:
            text = _mock_voice_response(question)

    return {"text_response": text, "audio_base64": None}


def _mock_voice_response(question: str) -> str:
    q = question.lower()
    if any(w in q for w in ["crash", "fail", "down", "crashing"]):
        return "The payment service is experiencing memory exhaustion with 88 percent heap usage. I recommend restarting it immediately and increasing the JVM heap size to 4 gigabytes."
    if any(w in q for w in ["cost", "bill", "expensive", "waste"]):
        return "Your infrastructure has 3 idle instances running for over 14 days. Terminating them would save approximately 420 dollars per month."
    if any(w in q for w in ["security", "risk", "breach", "exposed"]):
        return "There are 2 critical security risks. Your S3 bucket is publicly accessible and your database port is open to the internet. Both need immediate attention."
    return "Your infrastructure has 2 critical nodes and 3 warning nodes. I recommend running a full scan to get detailed failure predictions and remediation steps."

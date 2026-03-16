"""
Shared AWS Bedrock HTTP client.
All model calls route through here using Bearer token auth.
"""
import os
import json
import httpx
from typing import Any

REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")
TOKEN  = os.getenv("AWS_BEARER_TOKEN_BEDROCK", "")

# ── Model IDs ─────────────────────────────────────────────────────────────────
NOVA_2_LITE           = "us.amazon.nova-2-lite-v1:0"               # Main reasoning + chat
NOVA_2_SONIC          = "amazon.nova-2-sonic-v1:0"                 # Voice AI
NOVA_ACT              = "amazon.nova-act-v1:0"                     # Agent automation
NOVA_MULTIMODAL_EMBED = "amazon.nova-2-multimodal-embeddings-v1:0" # Embeddings


def _url(model_id: str) -> str:
    return f"https://bedrock-runtime.{REGION}.amazonaws.com/model/{model_id}/invoke"


def _headers() -> dict:
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {TOKEN}",
    }


async def invoke_nova(model_id: str, system: str, user_message: str, max_tokens: int = 512) -> str:
    """
    Invoke Nova 2 Lite (or any Nova converse-style model).
    Uses the Nova Invoke API format.
    """
    payload = {
        "messages": [{"role": "user", "content": [{"text": user_message}]}],
        "system": [{"text": system}],
        "inferenceConfig": {"maxTokens": max_tokens, "temperature": 0.3},
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(_url(model_id), json=payload, headers=_headers())
        if not resp.is_success:
            raise Exception(f"Bedrock error {resp.status_code}: {resp.text}")
        data = resp.json()
        content_list = data["output"]["message"]["content"]
        text_block = next((item for item in content_list if "text" in item), None)
        return text_block["text"] if text_block else ""


async def invoke_nova_sonic(text_prompt: str) -> dict:
    """
    Invoke Nova 2 Sonic for voice synthesis.
    Returns audio bytes (base64) + transcript.
    """
    payload = {
        "inputText": text_prompt,
        "voiceConfig": {"voiceId": "matthew"},
        "outputFormat": "mp3",
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(_url(NOVA_2_SONIC), json=payload, headers=_headers())
        resp.raise_for_status()
        data = resp.json()
        return {
            "audio_base64": data.get("audioStream", ""),
            "transcript": text_prompt,
        }


async def invoke_nova_act(task: str, context: dict = {}) -> dict:
    """
    Invoke Nova Act for agent automation tasks.
    Returns action plan + execution steps.
    """
    payload = {
        "task": task,
        "context": context,
        "maxSteps": 10,
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(_url(NOVA_ACT), json=payload, headers=_headers())
        resp.raise_for_status()
        return resp.json()


async def invoke_nova_embed(text: str) -> list[float]:
    """
    Nova Multimodal Embeddings — embed text for semantic search.
    """
    payload = {"inputText": text}
    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.post(_url(NOVA_MULTIMODAL_EMBED), json=payload, headers=_headers())
        resp.raise_for_status()
        return resp.json()["embedding"]

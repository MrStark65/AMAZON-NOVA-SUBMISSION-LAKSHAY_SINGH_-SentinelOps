"""
Semantic Search — Amazon Nova Multimodal Embeddings
Used for: log search, infrastructure search, AI assistant context retrieval.
Example: "Why did the payment service fail?" → finds related logs via vector similarity.
"""
import os
import math
from typing import List, Tuple
from .bedrock_client import invoke_nova_embed

HAS_BEDROCK = bool(
    os.getenv("AWS_BEARER_TOKEN_BEDROCK", "") not in ("", "paste-your-key-here")
)

# In-memory vector store — use pgvector or Redis in production
_store: List[Tuple[str, List[float], dict]] = []


async def index_text(text: str, metadata: dict = {}) -> None:
    """Embed and store a text chunk using Nova Multimodal Embeddings."""
    if not HAS_BEDROCK:
        # Store text without embedding for demo mode
        _store.append((text, [], metadata))
        return
    embedding = await invoke_nova_embed(text)
    _store.append((text, embedding, metadata))


async def search(query: str, top_k: int = 3) -> List[dict]:
    """
    Find most similar stored texts to the query.
    Uses Nova Multimodal Embeddings for semantic similarity.
    """
    if not _store:
        return []

    if not HAS_BEDROCK:
        return _keyword_fallback(query, top_k)

    query_embedding = await invoke_nova_embed(query)
    scored = [
        (_cosine(query_embedding, emb), text, meta)
        for text, emb, meta in _store
        if emb  # skip entries without embeddings
    ]
    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        {"score": round(score, 4), "text": text, "metadata": meta}
        for score, text, meta in scored[:top_k]
    ]


async def index_logs(logs: List[dict]) -> None:
    """Index log entries for semantic search."""
    for log in logs:
        text = f"[{log['level']}] {log['service']}: {log['message']}"
        await index_text(text, metadata={
            "timestamp": log["timestamp"],
            "service":   log["service"],
            "level":     log["level"],
        })


def _cosine(a: List[float], b: List[float]) -> float:
    if not a or not b:
        return 0.0
    dot   = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x ** 2 for x in a))
    mag_b = math.sqrt(sum(x ** 2 for x in b))
    return dot / (mag_a * mag_b) if mag_a and mag_b else 0.0


def _keyword_fallback(query: str, top_k: int) -> List[dict]:
    """Simple keyword match for demo mode without embeddings."""
    keywords = query.lower().split()
    scored = []
    for text, _, meta in _store:
        score = sum(1 for kw in keywords if kw in text.lower())
        if score > 0:
            scored.append((score, text, meta))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [
        {"score": s, "text": t, "metadata": m}
        for s, t, m in scored[:top_k]
    ]

from __future__ import annotations

import json
import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)

MOOD_OPTIONS = ("energetic", "melancholic", "curious", "romantic", "intense", "peaceful")


def _fallback_oracle_parse(message: str) -> dict:
    text = message.lower()
    mood = "curious"
    if any(token in text for token in ("calm", "quiet", "gentle", "cozy", "peaceful", "soft")):
        mood = "peaceful"
    elif any(token in text for token in ("sad", "grief", "heavy", "melanch", "lonely")):
        mood = "melancholic"
    elif any(token in text for token in ("love", "romance", "heart", "relationship")):
        mood = "romantic"
    elif any(token in text for token in ("thrill", "dark", "horror", "intense", "mystery", "tense")):
        mood = "intense"
    elif any(token in text for token in ("fast", "adventure", "action", "energetic", "hype")):
        mood = "energetic"

    pacing = 55
    if any(token in text for token in ("fast", "quick", "action", "pacey")):
        pacing = 80
    elif any(token in text for token in ("slow", "quiet", "lyrical", "gentle")):
        pacing = 30

    depth = 60
    if any(token in text for token in ("deep", "philosophy", "literary", "emotional", "layered")):
        depth = 80
    elif any(token in text for token in ("light", "easy", "fun", "comfort", "simple")):
        depth = 35

    return {
        "mood": mood,
        "pacing": pacing,
        "depth": depth,
        "analysis": (
            f"You seem to want a {mood} read with "
            f"{'faster' if pacing >= 70 else 'gentler' if pacing <= 35 else 'balanced'} pacing "
            f"and {'high' if depth >= 70 else 'lighter' if depth <= 40 else 'moderate'} emotional depth."
        ),
    }


def analyze_mood(mood: str, pacing: int, depth: int) -> dict:
    """
    Send mood/pacing/depth to Ollama and get back search queries + analysis.
    Falls back gracefully if Ollama is unavailable.
    """
    settings = get_settings()

    pacing_text = "fast-paced" if pacing >= 70 else "slow-paced" if pacing <= 30 else "moderately-paced"
    depth_text = "deeply emotional" if depth >= 70 else "light and fun" if depth <= 30 else "moderately emotional"

    prompt = (
        f"You are a book recommendation assistant helping users find novels and fiction books.\n\n"
        f"User mood: {mood}\n"
        f"Pacing preference: {pacing_text} ({pacing}/100)\n"
        f"Emotional depth preference: {depth_text} ({depth}/100)\n\n"
        f"Generate 5 diverse FICTION book search queries using genre keywords, themes, and subject terms "
        f"that will surface contemporary or classic NOVELS matching this mood. "
        f"Do NOT use specific book titles or author names. Do NOT include the words 'Google Books' or 'search'. "
        f"Use short keyword phrases like: 'literary fiction grief loss', 'fast paced thriller suspense', "
        f"'magical realism family saga', 'quiet introspective contemporary fiction', 'romance historical drama'.\n\n"
        f"Also write a single sentence (under 20 words) describing the ideal reading experience for this mood.\n\n"
        f"Return ONLY valid JSON, no markdown fences, no explanation:\n"
        f'{{"analysis": "...", "queries": ["...", "...", "...", "...", "..."]}}'
    )

    try:
        with httpx.Client(timeout=30.0, trust_env=not settings.disable_http_proxy) as client:
            response = client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                },
            )
            response.raise_for_status()
            raw = response.json().get("response", "{}")
            result = json.loads(raw)
            if "queries" in result and "analysis" in result:
                return result
    except Exception as exc:
        logger.warning("Ollama unavailable, using fallback: %s", exc)

    # Fallback: genre-focused keyword queries derived from the mood
    pacing_kw = "fast paced action" if pacing >= 70 else "slow quiet contemplative" if pacing <= 30 else "steady"
    depth_kw = "emotional literary character driven" if depth >= 70 else "light fun entertaining" if depth <= 30 else "engaging"
    mood_genre_map = {
        "energetic": "adventure thriller",
        "melancholic": "literary fiction grief loss",
        "melancholy": "literary fiction grief loss",
        "contemplative": "introspective quiet literary",
        "curious": "mystery discovery speculative fiction",
        "romantic": "romance drama love story",
        "intense": "dark thriller psychological",
        "peaceful": "cozy gentle slice of life",
        "whimsical": "magical realism fantasy whimsical",
        "nostalgic": "historical fiction coming of age",
        "tense": "suspense thriller dark drama",
    }
    genre_kw = mood_genre_map.get(mood.lower(), f"{mood} contemporary")
    return {
        "analysis": f"Looking for {mood} fiction with {pacing_text} pace and {depth_text} tone.",
        "queries": [
            f"{genre_kw} {depth_kw}",
            f"{pacing_kw} {genre_kw} novel",
            f"best {genre_kw} books",
            f"{genre_kw} {pacing_kw}",
            f"popular {depth_kw} {genre_kw}",
        ],
    }


def parse_oracle_prompt(message: str, history: list[str] | None = None) -> dict:
    """
    Parse a natural-language user request into recommendation controls.
    Returns: mood, pacing, depth, analysis.
    """
    settings = get_settings()
    history_lines = "\n".join((history or [])[-6:])
    prompt = (
        "You are a recommendation parser for a reading app.\n"
        "Extract the user's desired reading vibe and map it to strict fields.\n"
        f"Allowed moods: {', '.join(MOOD_OPTIONS)}.\n"
        "Pacing and depth must be integers 0-100.\n"
        "Return ONLY valid JSON with keys: mood, pacing, depth, analysis.\n\n"
        f"Conversation history (may be empty):\n{history_lines}\n\n"
        f"Latest user message:\n{message}\n"
    )

    try:
        with httpx.Client(timeout=30.0, trust_env=not settings.disable_http_proxy) as client:
            response = client.post(
                f"{settings.ollama_base_url}/api/generate",
                json={
                    "model": settings.ollama_model,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json",
                },
            )
            response.raise_for_status()
            raw = response.json().get("response", "{}")
            result = json.loads(raw)
            mood = str(result.get("mood", "")).lower()
            pacing = int(result.get("pacing", 55))
            depth = int(result.get("depth", 60))
            analysis = str(result.get("analysis", "")).strip()
            if mood not in MOOD_OPTIONS:
                mood = "curious"
            pacing = max(0, min(100, pacing))
            depth = max(0, min(100, depth))
            if not analysis:
                analysis = _fallback_oracle_parse(message)["analysis"]
            return {"mood": mood, "pacing": pacing, "depth": depth, "analysis": analysis}
    except Exception as exc:
        logger.warning("Ollama prompt parser unavailable, using fallback: %s", exc)

    return _fallback_oracle_parse(message)

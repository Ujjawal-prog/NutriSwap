"""Reads ingredients from a fridge photo or a grocery receipt using Claude vision."""
import base64
import json
import re

import requests

import config
from services.normalize import norm

API = "https://api.anthropic.com/v1/messages"
PROMPTS = {
    "fridge": "List the food ingredients visible in this fridge/pantry photo.",
    "receipt": "Read this grocery receipt and list only the food ingredients bought (ignore prices, totals, non-food).",
}
SYSTEM = (
    "You extract ingredients. Reply with ONLY a JSON array, no prose. Each element: "
    '{"name": lowercase singular common ingredient name, "confidence": integer 0-100, '
    '"qty": short quantity string like "200 g" or "4" or "1 bunch"}. Max 15 items.'
)
DEMO = [
    {"name": "paneer", "confidence": 94, "qty": "200 g"}, {"name": "capsicum", "confidence": 91, "qty": "3"},
    {"name": "onion", "confidence": 90, "qty": "4"}, {"name": "tomato", "confidence": 88, "qty": "4"},
    {"name": "spinach", "confidence": 85, "qty": "1 bunch"}, {"name": "garlic", "confidence": 80, "qty": "1 bulb"},
]


class VisionError(Exception):
    pass


def live() -> bool:
    return bool(config.ANTHROPIC_API_KEY)


def detect(image_bytes: bytes, mime: str, kind: str = "fridge") -> list[dict]:
    if not live():
        return DEMO  # demo mode so the UI works before you add a key
    body = {
        "model": config.ANTHROPIC_MODEL, "max_tokens": 800, "system": SYSTEM,
        "messages": [{"role": "user", "content": [
            {"type": "image", "source": {"type": "base64", "media_type": mime,
                                         "data": base64.b64encode(image_bytes).decode()}},
            {"type": "text", "text": PROMPTS.get(kind, PROMPTS["fridge"])}]}],
    }
    try:
        r = requests.post(API, json=body, timeout=45, headers={
            "x-api-key": config.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01",
            "content-type": "application/json"})
        r.raise_for_status()
        text = "".join(b.get("text", "") for b in r.json()["content"] if b.get("type") == "text")
        items = json.loads(re.search(r"\[.*\]", text, re.S).group(0))
    except (requests.RequestException, KeyError, AttributeError, json.JSONDecodeError) as e:
        raise VisionError("Could not read the image. Try a clearer photo.") from e
    return [{"name": norm(i["name"]), "confidence": int(i.get("confidence", 70)), "qty": str(i.get("qty", "1"))}
            for i in items if isinstance(i, dict) and i.get("name")]

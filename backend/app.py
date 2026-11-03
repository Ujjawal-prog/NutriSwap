import logging

from flask import Flask, jsonify, request
from flask_cors import CORS

import config
from services import foodoscope, matcher, vision
from services.normalize import norm_list

logging.basicConfig(level=logging.INFO)
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = config.MAX_UPLOAD_MB * 1024 * 1024
CORS(app, origins=config.CORS_ORIGINS)

ALLOWED = {"image/jpeg", "image/png", "image/webp", "image/gif"}


def err(msg, code=400):
    return jsonify({"error": msg}), code


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "recipes_source": foodoscope.source(),
                    "vision": "claude" if vision.live() else "demo"})


def _scan(kind):
    f = request.files.get("image")
    if not f:
        return err("Attach a photo in the 'image' field.")
    if f.mimetype not in ALLOWED:
        return err("Unsupported file type. Use JPG, PNG or WebP.")
    try:
        return jsonify({"items": vision.detect(f.read(), f.mimetype, kind)})
    except vision.VisionError as e:
        return err(str(e), 502)


@app.post("/api/vision/fridge")
def scan_fridge():
    return _scan("fridge")


@app.post("/api/vision/receipt")
def scan_receipt():
    return _scan("receipt")


@app.post("/api/qr")
def parse_qr():
    """The browser decodes the QR; send us its text (JSON list or comma/newline separated)."""
    text = (request.get_json(silent=True) or {}).get("text", "")
    if not text.strip():
        return err("Send the decoded QR text in 'text'.")
    parts = [p for chunk in text.replace("\n", ",").split(",") for p in [chunk.strip()] if p]
    return jsonify({"items": [{"name": n, "confidence": 99, "qty": "1"} for n in norm_list(parts)]})


@app.post("/api/recipes/match")
def recipes_match():
    have = (request.get_json(silent=True) or {}).get("have")
    if not isinstance(have, list) or not have:
        return err("Send a non-empty 'have' list of ingredient names.")
    return jsonify({"recipes": matcher.match(have), "source": foodoscope.source()})


@app.post("/api/swaps")
def swaps():
    ings = (request.get_json(silent=True) or {}).get("ingredients")
    if not isinstance(ings, list):
        return err("Send an 'ingredients' list.")
    return jsonify({"swaps": matcher.swaps_for(ings), "source": foodoscope.source()})


@app.post("/api/waste")
def waste():
    """Savings calculator used by the Impact section: monthly rupees wasted -> yearly saving."""
    try:
        monthly = float((request.get_json(silent=True) or {}).get("monthly", 0))
    except (TypeError, ValueError):
        return err("'monthly' must be a number.")
    if monthly < 0:
        return err("'monthly' cannot be negative.")
    return jsonify({"monthly": monthly, "yearly": round(monthly * 12, 2)})


@app.errorhandler(413)
def too_big(_):
    return err(f"Image too large (max {config.MAX_UPLOAD_MB} MB).", 413)


@app.errorhandler(500)
def boom(_):
    return err("Something went wrong on the server.", 500)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=config.PORT, debug=True)

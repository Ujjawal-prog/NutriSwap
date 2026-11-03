"""
Foodoscope (RecipeDB + FlavorDB) client.

The organizers hand out the exact base URLs, auth header and response shapes. Until you have
them, this module serves the built-in data in data/*.json so the whole app still works.

TO CONNECT THE REAL APIS, edit only the three `# TODO` spots below:
  1. _headers()               -> the auth header the organizers specify
  2. recipes_by_ingredients() -> the RecipeDB endpoint + mapping to our recipe shape
  3. swap_for()               -> the FlavorDB endpoint + mapping to our swap shape
Everything else (routes, matching, frontend) keeps working unchanged.
"""
import json
import logging
from pathlib import Path

import requests

import config
from services.normalize import norm

log = logging.getLogger(__name__)
DATA = Path(__file__).resolve().parent.parent / "data"
_RECIPES = json.loads((DATA / "recipes.json").read_text(encoding="utf-8"))
_SWAPS = json.loads((DATA / "swaps.json").read_text(encoding="utf-8"))

LIVE = bool(config.FOODOSCOPE_API_KEY and config.RECIPEDB_BASE_URL)


def _headers() -> dict:
    # TODO: replace with the header format Foodoscope documents (e.g. Authorization: Bearer <key>)
    return {"Authorization": f"Bearer {config.FOODOSCOPE_API_KEY}"}


def _get(url: str, params: dict | None = None):
    r = requests.get(url, headers=_headers(), params=params, timeout=10)
    r.raise_for_status()
    return r.json()


def all_recipes() -> list[dict]:
    return _RECIPES


def recipes_by_ingredients(have: list[str]) -> list[dict]:
    """Return candidate recipes in the shape {id,name,emoji,time,kcal,need:[...]}."""
    if LIVE:
        try:
            # TODO: call RecipeDB, e.g. _get(f"{config.RECIPEDB_BASE_URL}/<endpoint>", {"ingredients": ",".join(have)})
            # then map each item to {id, name, emoji, time, kcal, need}. Until mapped, fall through.
            pass
        except requests.RequestException as e:
            log.warning("RecipeDB unavailable, using fallback: %s", e)
    return _RECIPES


def swap_for(ingredient: str) -> dict | None:
    """Return {to,kcal,protein,fiber,why} for a healthier alternative, or None."""
    key = norm(ingredient)
    if LIVE and config.FLAVORDB_BASE_URL:
        try:
            # TODO: call FlavorDB (flavor-similar ingredients) and rank by nutrition from RecipeDB.
            pass
        except requests.RequestException as e:
            log.warning("FlavorDB unavailable, using fallback: %s", e)
    return _SWAPS.get(key)


def source() -> str:
    return "foodoscope" if LIVE else "fallback"

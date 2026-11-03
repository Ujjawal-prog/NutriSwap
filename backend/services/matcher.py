from services import foodoscope
from services.normalize import norm_list


def match(have: list[str]) -> list[dict]:
    have = norm_list(have)
    out = []
    for r in foodoscope.recipes_by_ingredients(have):
        need = norm_list(r["need"])
        got = [n for n in need if n in have]
        out.append({**r, "miss": [n for n in need if n not in have],
                    "pct": round(len(got) / len(need) * 100) if need else 0})
    return sorted(out, key=lambda x: (-x["pct"], x["time"]))


def swaps_for(ingredients: list[str]) -> list[dict]:
    out = []
    for ing in norm_list(ingredients):
        s = foodoscope.swap_for(ing)
        if s:
            out.append({"from": ing, **s})
    return out

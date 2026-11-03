"""Ingredient-name cleanup shared by every endpoint."""
SYNONYMS = {
    "bell pepper": "capsicum", "bell peppers": "capsicum", "capsicums": "capsicum",
    "yogurt": "curd", "yoghurt": "curd", "dahi": "curd",
    "maida": "refined flour", "all purpose flour": "refined flour", "all-purpose flour": "refined flour", "flour": "refined flour",
    "tomatoes": "tomato", "onions": "onion", "potatoes": "potato", "eggs": "egg",
    "carrots": "carrot", "mushrooms": "mushroom", "lemons": "lemon",
    "arhar dal": "toor dal", "tur dal": "toor dal", "toor": "toor dal",
    "garlic cloves": "garlic", "green peas": "peas", "cottage cheese": "paneer",
}


def norm(name: str) -> str:
    n = " ".join(str(name).lower().strip().split())
    return SYNONYMS.get(n, n)


def norm_list(names) -> list[str]:
    seen, out = set(), []
    for n in names or []:
        k = norm(n)
        if k and k not in seen:
            seen.add(k)
            out.append(k)
    return out

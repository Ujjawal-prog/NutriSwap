import io
from app import app

c = app.test_client()


def test_health():
    assert c.get("/api/health").get_json()["ok"]


def test_match_ranks_and_normalizes():
    r = c.post("/api/recipes/match", json={"have": ["Rice", "Bell Pepper", "paneer", "Onions", "garlic"]}).get_json()
    assert r["recipes"][0]["name"] == "Paneer Pepper Rice Bowl" and r["recipes"][0]["pct"] == 100


def test_match_validation():
    assert c.post("/api/recipes/match", json={"have": []}).status_code == 400


def test_swaps():
    s = c.post("/api/swaps", json={"ingredients": ["cream", "Maida", "tomato"]}).get_json()["swaps"]
    assert {x["from"] for x in s} == {"cream", "refined flour"}


def test_vision_demo_and_validation():
    ok = c.post("/api/vision/fridge", data={"image": (io.BytesIO(b"x"), "a.png", "image/png")}, content_type="multipart/form-data")
    assert ok.status_code == 200 and ok.get_json()["items"]
    assert c.post("/api/vision/fridge").status_code == 400
    bad = c.post("/api/vision/fridge", data={"image": (io.BytesIO(b"x"), "a.txt", "text/plain")}, content_type="multipart/form-data")
    assert bad.status_code == 400


def test_qr_and_waste():
    assert len(c.post("/api/qr", json={"text": "dahi, tur dal\nmaida"}).get_json()["items"]) == 3
    assert c.post("/api/waste", json={"monthly": 500}).get_json()["yearly"] == 6000

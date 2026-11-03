import os
from dotenv import load_dotenv

load_dotenv()

PORT = int(os.getenv("PORT", "5000"))
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")]

FOODOSCOPE_API_KEY = os.getenv("FOODOSCOPE_API_KEY", "")
RECIPEDB_BASE_URL = os.getenv("RECIPEDB_BASE_URL", "").rstrip("/")
FLAVORDB_BASE_URL = os.getenv("FLAVORDB_BASE_URL", "").rstrip("/")

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-5-5")

MAX_UPLOAD_MB = 8

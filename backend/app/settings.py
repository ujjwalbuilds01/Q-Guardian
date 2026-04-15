import os
from typing import List

from dotenv import load_dotenv

load_dotenv()


def _clean_csv(value: str) -> List[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


APP_ENV = os.getenv("APP_ENV", "development").strip().lower()

SECRET_KEY = os.getenv("SECRET_KEY", "").strip()
ALGORITHM = os.getenv("ALGORITHM", "HS256").strip()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "").strip()
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", "").strip()

FRONTEND_ORIGINS = _clean_csv(
    os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000",
    )
)

ALLOW_PRIVATE_SCAN_TARGETS = os.getenv("ALLOW_PRIVATE_SCAN_TARGETS", "false").strip().lower() == "true"

DISCOVERY_MAX_ASSETS = os.getenv("DISCOVERY_MAX_ASSETS", "").strip()
DISCOVERY_MAX_ASSETS = int(DISCOVERY_MAX_ASSETS) if DISCOVERY_MAX_ASSETS else None

DOCS_ENABLED = os.getenv("ENABLE_API_DOCS", "false" if APP_ENV == "production" else "true").strip().lower() == "true"

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./qguardian.db").strip()

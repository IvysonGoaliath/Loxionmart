from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
import secrets
import os


class Settings(BaseSettings):
    # ── Database ──
    DATABASE_URL: str

    # ── JWT ──
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # ── Ozow ──
    PAYMENTS_ENABLED: bool = False
    OZOW_SITE_CODE: str = ""
    OZOW_PRIVATE_KEY: str = ""
    OZOW_API_KEY: str = ""
    OZOW_IS_TEST: bool = True

    # ── Twilio WhatsApp ──
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"

    # ── Admin seed ──
    ADMIN_EMAIL: str = "admin@loxionmart.co.za"
    ADMIN_PASSWORD: str = "changeme123"

    # ── App ──
    FRONTEND_URL: str = "https://loxionmart.co.za"
    FRONTEND_HOST: Optional[str] = None
    ENVIRONMENT: str = "development"  # development | production

    @field_validator("DATABASE_URL")
    @classmethod
    def validate_db_url(cls, v: str) -> str:
        # Railway provides postgres:// — SQLAlchemy needs postgresql://
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        return v

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def public_frontend_url(self) -> str:
        if self.FRONTEND_HOST:
            host = self.FRONTEND_HOST.replace("https://", "").replace("http://", "").rstrip("/")
            return f"https://{host}"
        return self.FRONTEND_URL.rstrip("/")

    @property
    def public_api_url(self) -> str:
        host = os.getenv("RENDER_EXTERNAL_HOSTNAME", "").replace("https://", "").rstrip("/")
        return f"https://{host}" if host else "http://localhost:8000"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

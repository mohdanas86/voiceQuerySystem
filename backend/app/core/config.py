from __future__ import annotations

from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Voice Query API"
    env: str = "local"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = ""
    mongo_db_name: str = "voice_query"
    database_url: str
    resend_api_key: str = ""
    support_email: str = "support@ulavitech.com"
    log_level: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    def cors_origins_list(self) -> List[str]:
        if not self.cors_origins:
            return []
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # AWS
    aws_region: str = "ap-northeast-1"
    dynamodb_table_name: str = "milestone-manager"
    dynamodb_endpoint_url: str | None = None  # For local development

    # Cognito
    cognito_user_pool_id: str = ""
    cognito_client_id: str = ""

    # App
    environment: str = "development"
    debug: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://leisurespot:strongpassword@127.0.0.1:5433/leisurespot_db"
    redis_url: str = "redis://localhost:6379"
    jwt_secret: str = "your-super-secret-jwt-key-change-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 30
    environment: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()

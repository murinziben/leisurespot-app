from datetime import datetime, timedelta
from jose import JWTError, jwt
from api.config import settings


def create_access_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    payload["type"] = "access"
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict) -> str:
    payload = data.copy()
    payload["exp"] = datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)
    payload["type"] = "refresh"
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])


def get_token_expiry_days() -> datetime:
    return datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days)

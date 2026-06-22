from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from jose import JWTError

from api.database import get_db
from api.dependencies import get_current_user
from api.utils.jwt import create_access_token, create_refresh_token, decode_token, get_token_expiry_days
from api.utils.password import hash_password, verify_password
from api.schemas.auth import RegisterRequest, LoginRequest, RefreshRequest, TokenResponse, UserOut
from shared.models import User, Profile, RefreshToken, UserRole, Vendor


class ProfileUpdate(BaseModel):
    email: Optional[str] = None
    profile: Optional[dict] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: str

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=UserRole.CUSTOMER,
    )
    db.add(user)
    db.flush()

    profile = Profile(
        user_id=user.id,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
    )
    db.add(profile)

    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token_str = create_refresh_token({"sub": user.id})

    rt = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=get_token_expiry_days(),
    )
    db.add(rt)
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token_str)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account suspended")

    user.last_login = datetime.utcnow()

    access_token = create_access_token({"sub": user.id, "role": user.role})
    refresh_token_str = create_refresh_token({"sub": user.id})

    rt = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=get_token_expiry_days(),
    )
    db.add(rt)
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token_str)


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    rt = db.query(RefreshToken).filter(
        RefreshToken.token == body.refresh_token,
        RefreshToken.revoked == False,
    ).first()
    if not rt or rt.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expired or revoked")

    rt.revoked = True

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    access_token = create_access_token({"sub": user.id, "role": user.role})
    new_refresh = create_refresh_token({"sub": user.id})

    new_rt = RefreshToken(
        user_id=user.id,
        token=new_refresh,
        expires_at=get_token_expiry_days(),
    )
    db.add(new_rt)
    db.commit()

    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.post("/logout")
def logout(body: RefreshRequest, db: Session = Depends(get_db)):
    rt = db.query(RefreshToken).filter(RefreshToken.token == body.refresh_token).first()
    if rt:
        rt.revoked = True
        db.commit()
    return {"success": True, "message": "Logged out"}


@router.get("/me")
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_data = {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "last_login": current_user.last_login.isoformat() if current_user.last_login else None,
        "created_at": current_user.created_at.isoformat(),
        "profile": None,
        "vendor": None,
    }

    if current_user.profile:
        p = current_user.profile
        user_data["profile"] = {
            "first_name": p.first_name,
            "last_name": p.last_name,
            "phone": p.phone,
            "avatar_url": p.avatar_url,
            "bio": p.bio,
            "city": p.city,
        }

    if current_user.vendor:
        v = current_user.vendor
        user_data["vendor"] = {
            "id": v.id,
            "status": v.status,
            "business_name": v.business.name if v.business else None,
        }

    return {"success": True, "data": user_data}


@router.patch("/profile")
def update_profile(body: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.email and body.email != current_user.email:
        if db.query(User).filter(User.email == body.email, User.id != current_user.id).first():
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = body.email

    if body.profile:
        profile = current_user.profile
        if not profile:
            profile = Profile(user_id=current_user.id)
            db.add(profile)
        for field in ("first_name", "last_name", "phone", "city", "bio", "avatar_url"):
            if field in body.profile:
                setattr(profile, field, body.profile[field])

    db.commit()
    return {"success": True, "message": "Profile updated"}


@router.post("/change-password")
def change_password(body: ChangePasswordRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    current_user.password_hash = hash_password(body.new_password)
    db.commit()
    return {"success": True, "message": "Password changed"}


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Always return success — never reveal whether an email exists
    # In production: send a reset email here
    return {"success": True, "message": "If that email is registered, you'll receive a reset link shortly"}

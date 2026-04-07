from __future__ import annotations

import os
from functools import lru_cache

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .database import get_db
from .models import User

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN", "mapboard.eu.auth0.com")
AUTH0_AUDIENCE = os.getenv("AUTH0_AUDIENCE", "https://mapboard.eu.auth0.com/api/v2/")
AUTH_SKIP_VERIFY = os.getenv("AUTH_SKIP_VERIFY", "true").lower() == "true"
ALGORITHMS = ["RS256"]

bearer_scheme = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def _get_jwks() -> dict:
    response = httpx.get(f"https://{AUTH0_DOMAIN}/.well-known/jwks.json", timeout=10)
    response.raise_for_status()
    return response.json()


def _decode_unverified(token: str) -> dict:
    try:
        return jwt.get_unverified_claims(token)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc


def _verify_token(token: str) -> dict:
    if AUTH_SKIP_VERIFY:
        return _decode_unverified(token)

    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token header") from exc

    rsa_key = {}
    for key in _get_jwks().get("keys", []):
        if key.get("kid") == unverified_header.get("kid"):
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
            break

    if not rsa_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unable to find signing key")

    try:
        return jwt.decode(
            token,
            rsa_key,
            algorithms=ALGORITHMS,
            audience=AUTH0_AUDIENCE,
            issuer=f"https://{AUTH0_DOMAIN}/",
        )
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token validation failed") from exc


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = _verify_token(credentials.credentials)
    sub = payload.get("sub")
    if not sub:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token subject")

    email = payload.get("email") or payload.get("name") or sub
    name = payload.get("name") or email

    user = db.query(User).filter(User.auth0_sub == sub).first()
    if user is None:
        user = User(auth0_sub=sub, email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        changed = False
        if user.email != email:
            user.email = email
            changed = True
        if user.name != name:
            user.name = name
            changed = True
        if changed:
            db.commit()
            db.refresh(user)

    return user

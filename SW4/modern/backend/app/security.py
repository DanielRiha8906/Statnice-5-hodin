"""Bezpečnostní pomocné funkce a FastAPI dependencies."""

from __future__ import annotations

import hashlib
import secrets

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AuthToken, User


def hash_password(password: str) -> str:
    """Vrátí hash hesla.

    Ve školním projektu nechceme natahovat další knihovny jen kvůli hashování.
    V produkci by bylo vhodnější použít `passlib` s bcrypt/argon2.
    """

    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash


def generate_token() -> str:
    return secrets.token_hex(32)


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    """Vyžádá si Bearer token a vrátí aktuálního uživatele."""

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chybí autorizační token.",
        )

    token_value = authorization.replace("Bearer ", "", 1).strip()
    token = db.query(AuthToken).filter(AuthToken.token == token_value).first()

    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Neplatný nebo expirovaný token.",
        )

    return token.user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency pro endpointy dostupné jen administrátorům."""

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tato operace je povolená pouze administrátorovi.",
        )

    return current_user


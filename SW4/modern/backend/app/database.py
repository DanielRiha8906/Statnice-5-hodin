"""Databázová konfigurace FastAPI aplikace.

Používáme SQLite, protože jde o relační databázi, která je snadno spustitelná
bez instalace serveru. Pro demonstrační a školní účely je to velmi praktické.
"""

from __future__ import annotations

from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DATABASE_URL = f"sqlite:///{DATA_DIR / 'warehouse_modern.sqlite'}"


class Base(DeclarativeBase):
    """Společný SQLAlchemy base class pro všechny modely."""


engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency pro FastAPI, která vrací databázovou session."""

    database = SessionLocal()
    try:
        yield database
    finally:
        database.close()


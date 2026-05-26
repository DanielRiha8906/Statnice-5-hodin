"""Inicializace výchozích dat."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Product, User
from app.security import hash_password


def seed_initial_data(db: Session) -> None:
    """Naplní databázi výchozím adminem a několika produkty."""

    if db.query(User).count() > 0:
        return

    admin = User(
        username="admin",
        full_name="Výchozí správce",
        role="admin",
        password_hash=hash_password("admin123"),
    )
    worker = User(
        username="worker",
        full_name="Ukázkový skladník",
        role="worker",
        password_hash=hash_password("worker123"),
    )

    products = [
        Product(
            name="Aku vrtačka 18V",
            category="Stavebnictví",
            sku="TOOL-101",
            description="Výkonná vrtačka pro běžné montážní práce.",
            price=3490,
            quantity_in_stock=14,
            low_stock_threshold=5,
        ),
        Product(
            name="Pytel cementu 25kg",
            category="Stavebnictví",
            sku="MAT-250",
            description="Portlandský cement pro stavební použití.",
            price=159,
            quantity_in_stock=8,
            low_stock_threshold=10,
        ),
        Product(
            name="Pracovní helma",
            category="Bezpečnost",
            sku="SAFE-020",
            description="Ochranná přilba pro pracovníky na stavbě.",
            price=499,
            quantity_in_stock=22,
            low_stock_threshold=6,
        ),
    ]

    db.add(admin)
    db.add(worker)
    db.add_all(products)
    db.commit()


"""Základní integrační testy FastAPI backendu.

Testy ověřují hlavní uživatelské scénáře:

- přihlášení,
- načtení dashboardu,
- vytvoření produktu,
- vytvoření objednávky,
- a správu uživatelů administrátorem.
"""

from __future__ import annotations

from collections.abc import Generator
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app
from app.seed import seed_initial_data


TEST_DATABASE_URL = "sqlite:///./test_warehouse_modern.sqlite"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db() -> Generator[Session, None, None]:
    """Vrací testovací databázovou session místo produkční."""

    database = TestingSessionLocal()
    try:
        yield database
    finally:
        database.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def prepare_database() -> Generator[None, None, None]:
    """Před každým testem obnoví čistou testovací databázi."""

    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    database = TestingSessionLocal()
    try:
        seed_initial_data(database)
    finally:
        database.close()

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """Vrátí FastAPI test client."""

    with TestClient(app) as test_client:
        yield test_client


def login_and_get_token(client: TestClient, username: str, password: str) -> str:
    """Přihlásí uživatele a vrátí autorizační token."""

    response = client.post(
        "/auth/login",
        json={"username": username, "password": password},
    )
    assert response.status_code == 200
    return response.json()["token"]


def test_login_returns_token_and_user(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"username": "admin", "password": "admin123"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["token"]
    assert payload["user"]["username"] == "admin"
    assert payload["user"]["role"] == "admin"


def test_dashboard_requires_authorization(client: TestClient) -> None:
    response = client.get("/dashboard")

    assert response.status_code == 401


def test_dashboard_returns_summary_for_logged_user(client: TestClient) -> None:
    token = login_and_get_token(client, "worker", "worker123")
    response = client.get(
        "/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["product_count"] >= 1
    assert "low_stock_products" in payload
    assert "recent_orders" in payload


def test_admin_can_create_product(client: TestClient) -> None:
    token = login_and_get_token(client, "admin", "admin123")

    response = client.post(
        "/products",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "Laserový dálkoměr",
            "category": "Měření",
            "sku": "MEASURE-900",
            "description": "Přesný měřicí přístroj pro délkové měření.",
            "price": 2190,
            "quantity_in_stock": 7,
            "low_stock_threshold": 2,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["sku"] == "MEASURE-900"
    assert payload["is_low_stock"] is False


def test_creating_order_reduces_product_stock(client: TestClient) -> None:
    token = login_and_get_token(client, "worker", "worker123")

    products_before = client.get(
        "/products",
        headers={"Authorization": f"Bearer {token}"},
    ).json()
    selected_product = products_before[0]
    original_stock = selected_product["quantity_in_stock"]

    create_response = client.post(
        "/orders",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "customer_name": "Testovací zákazník",
            "note": "Objednávka z integračního testu",
            "items": [
                {
                    "product_id": selected_product["id"],
                    "quantity": 2,
                }
            ],
        },
    )

    assert create_response.status_code == 200
    created_order = create_response.json()
    assert created_order["customer_name"] == "Testovací zákazník"
    assert len(created_order["items"]) == 1

    products_after = client.get(
        "/products",
        headers={"Authorization": f"Bearer {token}"},
    ).json()
    updated_product = next(
        product for product in products_after if product["id"] == selected_product["id"]
    )

    assert updated_product["quantity_in_stock"] == original_stock - 2


def test_only_admin_can_create_user(client: TestClient) -> None:
    worker_token = login_and_get_token(client, "worker", "worker123")
    forbidden_response = client.post(
        "/users",
        headers={"Authorization": f"Bearer {worker_token}"},
        json={
            "username": "new-worker",
            "full_name": "Nový skladník",
            "password": "heslo123",
            "role": "worker",
        },
    )
    assert forbidden_response.status_code == 403

    admin_token = login_and_get_token(client, "admin", "admin123")
    success_response = client.post(
        "/users",
        headers={"Authorization": f"Bearer {admin_token}"},
        json={
            "username": "new-worker",
            "full_name": "Nový skladník",
            "password": "heslo123",
            "role": "worker",
        },
    )

    assert success_response.status_code == 200
    assert success_response.json()["username"] == "new-worker"


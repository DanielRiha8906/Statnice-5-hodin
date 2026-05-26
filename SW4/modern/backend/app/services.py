"""Aplikační logika moderní backend varianty."""

from __future__ import annotations

from datetime import datetime
from typing import Iterable

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.models import AuthToken, Order, OrderItem, Product, User
from app.schemas import OrderResponse, OrderItemResponse, ProductResponse
from app.security import generate_token, verify_password


ORDER_STATUSES = {"new", "processing", "completed", "cancelled"}


def login_user(db: Session, username: str, password: str) -> tuple[str, User]:
    """Ověří uživatele a vydá mu persistentní API token."""

    user = db.query(User).filter(User.username == username).first()
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Neplatné přihlašovací údaje.",
        )

    token_value = generate_token()
    token = AuthToken(token=token_value, user_id=user.id)
    db.add(token)
    db.commit()
    return token_value, user


def product_to_response(product: Product) -> ProductResponse:
    """Převod ORM entity na response schéma se spočteným low-stock příznakem."""

    return ProductResponse(
        id=product.id,
        name=product.name,
        category=product.category,
        sku=product.sku,
        description=product.description,
        price=product.price,
        quantity_in_stock=product.quantity_in_stock,
        low_stock_threshold=product.low_stock_threshold,
        created_at=product.created_at,
        updated_at=product.updated_at,
        is_low_stock=product.quantity_in_stock <= product.low_stock_threshold,
    )


def order_to_response(order: Order) -> OrderResponse:
    """Převod objednávky včetně položek na API response."""

    items = [
        OrderItemResponse(
            id=item.id,
            product_id=item.product_id,
            product_name=item.product.name,
            product_sku=item.product.sku,
            quantity=item.quantity,
            unit_price=item.unit_price,
        )
        for item in order.items
    ]

    return OrderResponse(
        id=order.id,
        order_number=order.order_number,
        customer_name=order.customer_name,
        note=order.note,
        status=order.status,
        total_price=order.total_price,
        created_at=order.created_at,
        updated_at=order.updated_at,
        created_by_name=order.created_by.full_name,
        items=items,
    )


def fetch_orders_with_relations(db: Session) -> list[Order]:
    """Načte objednávky i s navázanými položkami a produkty."""

    return (
        db.query(Order)
        .options(
            joinedload(Order.created_by),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.created_at.desc())
        .all()
    )


def create_order(
    db: Session,
    customer_name: str,
    note: str,
    items_data: Iterable[dict[str, int]],
    current_user: User,
) -> Order:
    """Vytvoří objednávku a zároveň odečte zboží ze skladu."""

    if not customer_name.strip():
        raise HTTPException(status_code=400, detail="Jméno zákazníka je povinné.")

    if not items_data:
        raise HTTPException(status_code=400, detail="Objednávka musí mít alespoň jednu položku.")

    order_items: list[OrderItem] = []
    total_price = 0.0

    for item_data in items_data:
        product = db.query(Product).filter(Product.id == item_data["product_id"]).first()
        if product is None:
            raise HTTPException(status_code=404, detail="Některý produkt neexistuje.")

        quantity = item_data["quantity"]
        if product.quantity_in_stock < quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Produkt '{product.name}' nemá na skladě dost kusů.",
            )

        product.quantity_in_stock -= quantity
        product.updated_at = datetime.utcnow()
        total_price += product.price * quantity

        order_items.append(
            OrderItem(product_id=product.id, quantity=quantity, unit_price=product.price)
        )

    order = Order(
        order_number=f"ORD-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}",
        customer_name=customer_name.strip(),
        note=note.strip(),
        status="new",
        total_price=total_price,
        created_by_user_id=current_user.id,
        updated_at=datetime.utcnow(),
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return (
        db.query(Order)
        .options(
            joinedload(Order.created_by),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order.id)
        .first()
    )


def update_order_status(db: Session, order_id: int, status_value: str) -> Order:
    """Změní stav objednávky."""

    if status_value not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Neplatný stav objednávky.")

    order = db.query(Order).filter(Order.id == order_id).first()
    if order is None:
        raise HTTPException(status_code=404, detail="Objednávka nebyla nalezena.")

    order.status = status_value
    order.updated_at = datetime.utcnow()
    db.commit()

    return (
        db.query(Order)
        .options(
            joinedload(Order.created_by),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order.id)
        .first()
    )


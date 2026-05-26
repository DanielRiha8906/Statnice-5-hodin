"""Hlavní FastAPI aplikace pro skladový systém."""

from __future__ import annotations

from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db, SessionLocal
from app.models import Product, User
from app.schemas import (
    DashboardResponse,
    LoginRequest,
    LoginResponse,
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    UserCreate,
    UserResponse,
)
from app.security import get_current_user, hash_password, require_admin
from app.seed import seed_initial_data
from app.services import (
    create_order,
    fetch_orders_with_relations,
    login_user,
    order_to_response,
    product_to_response,
    update_order_status,
)


app = FastAPI(
    title="SkladPro Modern API",
    description="FastAPI verze skladového systému se zabezpečením přes tokeny.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def initialize_application_data() -> None:
    """Vytvoří databázové schéma a vloží seed data.

    Funkci držíme samostatně, aby byla znovupoužitelná i v testech. To je hezký
    příklad malé refaktorizace ve prospěch testovatelnosti.
    """

    Base.metadata.create_all(bind=engine)
    database = SessionLocal()
    try:
        seed_initial_data(database)
    finally:
        database.close()


@app.on_event("startup")
def startup_event() -> None:
    """Inicializuje aplikaci při startu serveru."""

    initialize_application_data()


@app.get("/")
def healthcheck() -> dict[str, str]:
    return {"message": "SkladPro Modern API běží."}


@app.post("/auth/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    token, user = login_user(db, payload.username, payload.password)
    return LoginResponse(token=token, user=UserResponse.model_validate(user))


@app.get("/dashboard", response_model=DashboardResponse)
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardResponse:
    """Vrátí souhrnné informace pro dashboard frontend klienta."""

    products = db.query(Product).order_by(Product.updated_at.desc()).all()
    orders = fetch_orders_with_relations(db)
    low_stock_products = [product_to_response(product) for product in products if product.quantity_in_stock <= product.low_stock_threshold]
    recent_orders = [order_to_response(order) for order in orders[:5]]

    total_stock_value = sum(product.price * product.quantity_in_stock for product in products)

    return DashboardResponse(
        product_count=len(products),
        order_count=len(orders),
        total_stock_value=total_stock_value,
        low_stock_count=len(low_stock_products),
        low_stock_products=low_stock_products,
        recent_orders=recent_orders,
    )


@app.get("/products", response_model=list[ProductResponse])
def list_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProductResponse]:
    products = db.query(Product).order_by(Product.updated_at.desc()).all()
    return [product_to_response(product) for product in products]


@app.post("/products", response_model=ProductResponse)
def create_product(
    payload: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductResponse:
    existing_product = db.query(Product).filter(Product.sku == payload.sku).first()
    if existing_product is not None:
        raise HTTPException(status_code=400, detail="Produkt s tímto SKU už existuje.")

    now = datetime.utcnow()
    product = Product(**payload.model_dump(), created_at=now, updated_at=now)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product_to_response(product)


@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductResponse:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Produkt nebyl nalezen.")

    for field_name, field_value in payload.model_dump().items():
        setattr(product, field_name, field_value)
    product.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(product)
    return product_to_response(product)


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    product = db.query(Product).filter(Product.id == product_id).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Produkt nebyl nalezen.")

    if product.order_items:
        raise HTTPException(
            status_code=400,
            detail="Produkt nelze smazat, protože je navázaný na objednávky.",
        )

    db.delete(product)
    db.commit()
    return {"message": f"Produkt '{product.name}' byl smazán."}


@app.get("/stock-alerts", response_model=list[ProductResponse])
def stock_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProductResponse]:
    products = db.query(Product).order_by(Product.quantity_in_stock.asc()).all()
    return [
        product_to_response(product)
        for product in products
        if product.quantity_in_stock <= product.low_stock_threshold
    ]


@app.get("/orders", response_model=list[OrderResponse])
def list_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[OrderResponse]:
    return [order_to_response(order) for order in fetch_orders_with_relations(db)]


@app.post("/orders", response_model=OrderResponse)
def create_new_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderResponse:
    order = create_order(
        db,
        payload.customer_name,
        payload.note,
        [item.model_dump() for item in payload.items],
        current_user,
    )
    return order_to_response(order)


@app.patch("/orders/{order_id}/status", response_model=OrderResponse)
def patch_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrderResponse:
    order = update_order_status(db, order_id, payload.status)
    return order_to_response(order)


@app.get("/users", response_model=list[UserResponse])
def list_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> list[UserResponse]:
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(user) for user in users]


@app.post("/users", response_model=UserResponse)
def create_user(
    payload: UserCreate,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
) -> UserResponse:
    existing_user = db.query(User).filter(User.username == payload.username).first()
    if existing_user is not None:
        raise HTTPException(status_code=400, detail="Uživatel s tímto jménem už existuje.")

    if payload.role not in {"admin", "worker"}:
        raise HTTPException(status_code=400, detail="Role musí být admin nebo worker.")

    user = User(
        username=payload.username,
        full_name=payload.full_name,
        role=payload.role,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)

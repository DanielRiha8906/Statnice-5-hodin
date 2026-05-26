"""Pydantic schémata pro requesty a response payloady."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class UserBase(BaseModel):
    username: str
    full_name: str
    role: str


class UserCreate(UserBase):
    password: str = Field(min_length=4)


class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class LoginResponse(BaseModel):
    token: str
    user: UserResponse


class ProductBase(BaseModel):
    name: str
    category: str
    sku: str
    description: str
    price: float = Field(ge=0)
    quantity_in_stock: int = Field(ge=0)
    low_stock_threshold: int = Field(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_low_stock: bool

    model_config = {"from_attributes": True}


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    product_sku: str
    quantity: int
    unit_price: float


class OrderCreate(BaseModel):
    customer_name: str
    note: str = ""
    items: list[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: str


class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    note: str
    status: str
    total_price: float
    created_at: datetime
    updated_at: datetime
    created_by_name: str
    items: list[OrderItemResponse]


class DashboardResponse(BaseModel):
    product_count: int
    order_count: int
    total_stock_value: float
    low_stock_count: int
    low_stock_products: list[ProductResponse]
    recent_orders: list[OrderResponse]


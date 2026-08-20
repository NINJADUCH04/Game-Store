from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    location: str

    model_config = ConfigDict(from_attributes=True)


class PaginatedProductsResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class OrderCreate(BaseModel):
    product_id: int


class OrderResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product_title: str
    buyer_username: str
    unit_price: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

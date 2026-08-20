from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# --- Auth Schemas ---
class UserCreate(BaseModel):
    username: str
    email: str
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


# --- Product Schemas ---
class ProductResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    price: float
    location: str

    model_config = ConfigDict(from_attributes=True)


class PaginatedProductsResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# --- Order Schemas ---
class OrderCreate(BaseModel):
    product_id: int




class OrderResponse(BaseModel):
    id: UUID | str
    user_id: int
    product_id: int
    product_title: str
    buyer_username: str
    unit_price: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)  # Pydantic v2
    # If using Pydantic v1:
    # class Config:
    #     orm_mode = True
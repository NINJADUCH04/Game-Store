from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.models import User
from app.core.schemas import ProductResponse, PaginatedProductsResponse
from app.core.auth import get_current_user
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=PaginatedProductsResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    location: Optional[str] = Query(None, pattern="^(JO|SA)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    return product_service.list_products(db, page, page_size, location)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProductResponse:
    return product_service.get_product(db, product_id)

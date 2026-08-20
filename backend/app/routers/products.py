from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
import math

from app.database import get_db
from app.models import Product, User
from app.schemas import ProductResponse, PaginatedProductsResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=PaginatedProductsResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    location: Optional[str] = Query(None, regex="^(JO|SA)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Product)
    if location:
        query = query.filter(Product.location == location.upper())

    total = query.count()
    offset = (page - 1) * page_size
    items = query.offset(offset).limit(page_size).all()
    total_pages = math.ceil(total / page_size) if total > 0 else 1

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
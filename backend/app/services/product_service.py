import math
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.models import Product


def list_products(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    location: Optional[str] = None,
    search: Optional[str] = None,
) -> dict:
    query = db.query(Product)
    if location:
        query = query.filter(Product.location == location.upper())
    if search:
        query = query.filter(Product.title.ilike(f"%{search}%"))

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


def get_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product

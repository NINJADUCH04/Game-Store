import logging
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.schemas import ProductResponse, PaginatedProductsResponse
from app.core.auth import get_current_user
from app.db import product_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/products", tags=["Products"])


@router.get("", response_model=PaginatedProductsResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    location: Optional[str] = Query(None, pattern="^(JO|SA)$"),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    logger.info(f"List products: page={page}, page_size={page_size}, location={location}, search='{search}', user='{current_user.username}'")
    result = product_service.list_products(db, page, page_size, location, search)
    logger.info(f"Returned {len(result['items'])} products (total={result['total']}, pages={result['total_pages']})")
    return result


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProductResponse:
    logger.info(f"Get product: id={product_id}, user='{current_user.username}'")
    return product_service.get_product(db, product_id)

import logging

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.schemas import OrderCreate, OrderResponse
from app.core.auth import get_current_user
from app.db import order_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    logger.info(f"Create order: product_id={order_data.product_id}, user='{current_user.username}'")
    result = order_service.create_order(db, order_data, current_user)
    logger.info(f"Order created: id={result.id}, product='{result.product_title}', price={result.unit_price}")
    return result


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> OrderResponse:
    logger.info(f"Get order: id={order_id}, user='{current_user.username}'")
    return order_service.get_order(db, order_id, current_user)

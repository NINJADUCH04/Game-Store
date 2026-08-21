import logging
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.db.models import Product, Order, User
from app.core.schemas import OrderCreate

logger = logging.getLogger(__name__)


def create_order(db: Session, order_data: OrderCreate, current_user: User) -> Order:
    product = db.query(Product).filter(Product.id == order_data.product_id).first()
    if not product:
        logger.warning(f"Order failed: product_id={order_data.product_id} not found, user='{current_user.username}'")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    new_order = Order(
        user_id=current_user.id,
        product_id=product.id,
        product_title=product.title,
        buyer_username=current_user.username,
        unit_price=product.price,
        created_at=datetime.now(timezone.utc),
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    logger.info(f"Order created: id={new_order.id}, product='{product.title}', price={product.price}, buyer='{current_user.username}'")
    return new_order


def get_order(db: Session, order_id: int, current_user: User) -> Order:
    order = (
        db.query(Order)
        .filter(Order.id == order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        logger.warning(f"Order not found: id={order_id}, user='{current_user.username}'")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    logger.debug(f"Order retrieved: id={order.id}, product='{order.product_title}'")
    return order

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import datetime, timezone
from app.database import get_db
from app.models import Product, Order, User
from app.schemas import OrderCreate, OrderResponse
from app.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == order_data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_order = Order(
        user_id=current_user.id,
        product_id=product.id,
        product_title=product.title,
        buyer_username=current_user.username,
        unit_price=product.price,
        created_at=datetime.now(timezone.utc)  # <-- Explicitly set datetime in Python
    )

    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return new_order
@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
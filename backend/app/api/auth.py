import logging

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.core.schemas import UserCreate, UserResponse, Token
from app.services import auth_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post(
    "/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED
)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    logger.info(f"Registration attempt for username='{user_in.username}', email='{user_in.email}'")
    result = auth_service.register_user(db, user_in)
    logger.info(f"User registered successfully: id={result.id}, username='{result.username}'")
    return result


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
) -> dict:
    logger.info(f"Login attempt for username='{form_data.username}'")
    result = auth_service.authenticate_user(db, form_data.username, form_data.password)
    logger.info(f"Login successful for username='{form_data.username}'")
    return result

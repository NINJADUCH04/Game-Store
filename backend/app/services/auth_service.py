import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.models import User
from app.core.schemas import UserCreate
from app.core.auth import get_password_hash, verify_password, create_access_token

logger = logging.getLogger(__name__)


def register_user(db: Session, user_in: UserCreate) -> User:
    if db.query(User).filter(User.username == user_in.username).first():
        logger.warning(f"Registration failed: username '{user_in.username}' already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered",
        )
    if db.query(User).filter(User.email == user_in.email).first():
        logger.warning(f"Registration failed: email '{user_in.email}' already exists")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info(f"User created: id={user.id}, username='{user.username}'")
    return user


def authenticate_user(db: Session, username: str, password: str) -> dict:
    user = db.query(User).filter(User.username == username).first()
    if not user:
        logger.warning(f"Login failed: user '{username}' not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not verify_password(password, user.hashed_password):
        logger.warning(f"Login failed: wrong password for user '{username}'")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    access_token = create_access_token(data={"sub": user.username})
    logger.info(f"Token issued for user '{username}'")
    return {"access_token": access_token, "token_type": "bearer"}

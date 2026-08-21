import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

def _create_engine_with_retry(url: str, retries: int = 10, delay: int = 2):
    for attempt in range(retries):
        try:
            engine = create_engine(url)
            engine.connect()
            return engine
        except Exception:
            if attempt == retries - 1:
                raise
            time.sleep(delay)

engine = _create_engine_with_retry(settings.DATABASE_URL)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for SQLAlchemy models
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
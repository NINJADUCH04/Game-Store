import csv
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, engine, Base
from app.models import Product

def import_csv(file_path: str):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        with open(file_path, mode="r", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            for row in reader:
                product = Product(
                    id=int(row["id"].strip()),
                    title=row["title"].strip(),
                    description=row["description"].strip() if row.get("description") else None,
                    price=float(row["price"].strip()),
                    location=row["location"].strip().upper()
                )
                db.merge(product)  # Upsert matching records
            db.commit()
            print("Successfully imported CSV data into PostgreSQL!")
    except Exception as e:
        db.rollback()
        print(f"Error importing CSV: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import_csv("data.csv")
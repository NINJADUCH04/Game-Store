# Digital Game Store

A full-stack web application for browsing and purchasing digital games with location-based inventory.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    Database     │
│   (Next.js)     │     │    (FastAPI)    │     │  (PostgreSQL)   │
│   Port 3000     │     │   Port 8000     │     │   Port 5432     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, React 19, TypeScript | SSR/SSG React framework |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| HTTP Client | Axios | API communication |
| Backend | FastAPI, Python | REST API framework |
| ORM | SQLAlchemy 2.0 | Database abstraction |
| Database | PostgreSQL 15+ | Persistent storage |
| Auth | JWT (python-jose) | Token-based auth |
| Migrations | Alembic | Schema versioning |
| Testing | pytest, httpx | Unit/integration tests |

## Why PostgreSQL

I chose PostgreSQL for this project because it's exceptionally reliable, easy to set up, and scales effortlessly as the platform grows. For a digital game store, data consistency is non-negotiable—orders require strict ACID compliance, foreign key constraints, and accurate price snapshots, all of which PostgreSQL handles out of the box. It offers native UUID support, flexible JSON handling for game metadata, and seamless integration with Python and SQLAlchemy. It is production-ready, widely adopted, and the clear best choice for transactional systems.

SQLite is supported only as a convenience fallback when DATABASE_URL is not configured, mainly for quick local testing. PostgreSQL should be used for normal development and evaluation.

1. **Data Integrity** - Game store requires strict referential integrity (users ↔ orders ↔ products). PostgreSQL's constraint system prevents orphaned records.

2. **JSONB for Metadata** - Product metadata (tags, platforms, requirements) can be stored as JSONB, enabling flexible queries without schema changes.

3. **Concurrency Handling** - Multiple users purchasing simultaneously requires MVCC. PostgreSQL handles concurrent reads/writes without locking.

4. **Geographic Queries** - Location-based product filtering (JO/SA regions) can leverage PostGIS if extended.

5. **Production Readiness** - Battle-tested in e-commerce (Shopify, Spotify). Supports replication, point-in-time recovery, and high availability.

## Backend Structure

```
backend/
├── app/
│   ├── core/
│   │   ├── auth.py          # JWT, password hashing
│   │   ├── config.py        # Pydantic BaseSettings
│   │   ├── database.py      # SQLAlchemy engine/session
│   │   ├── models.py        # ORM models
│   │   └── schemas.py       # Pydantic schemas
│   ├── routers/
│   │   ├── auth.py          # /api/auth/*
│   │   ├── products.py      # /api/products/*
│   │   └── orders.py        # /api/orders/*
│   ├── services/
│   │   ├── auth_service.py  # Auth business logic
│   │   ├── product_service.py
│   │   └── order_service.py
│   └── main.py              # FastAPI app entry
├── alembic/                 # Database migrations
├── tests/                   # pytest test suite
├── data/data.csv            # Seed data
├── scripts/import_csv.py    # Data import utility
├── requirements.txt
├── requirements-test.txt
└── .env.example
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/api/auth/register` | No | Create user account |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/api/products` | Yes | List products (paginated, filterable) |
| GET | `/api/products/{id}` | Yes | Get product details |
| POST | `/api/orders` | Yes | Create order |
| GET | `/api/orders/{id}` | Yes | Get order details |

### Authentication

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "user1", "email": "user1@example.com", "password": "pass123"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=user1&password=pass123"

# Use token for protected routes
curl http://localhost:8000/api/products \
  -H "Authorization: Bearer <token>"
```

## Frontend Structure

```
frontend/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── products/         # Product listing + detail
│   │   └── receipt/          # Order receipt
│   ├── components/           # Reusable UI components
│   ├── context/              # AuthContext (state management)
│   └── services/             # API client (Axios)
└── package.json
```

## Security

- **Password Hashing** — bcrypt via pwdlib
- **JWT Tokens** — HS256 with 24h expiry
- **CORS** — Configurable allowed origins
- **SQL Injection** — SQLAlchemy ORM parameterized queries
- **Input Validation** — Pydantic schemas enforce types at runtime

## Testing

```bash
cd backend
pip install -r requirements-test.txt
pytest                    # Run all tests + coverage
pytest tests/test_auth.py # Run specific module
```

**Coverage: 97%** — 30 tests across auth, products, orders, and health.

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL 15+

### Database Setup

```sql
CREATE DATABASE game_store;
CREATE USER store_user WITH PASSWORD 'securepassword';
GRANT ALL PRIVILEGES ON DATABASE game_store TO store_user;
```

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python scripts/import_csv.py
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://store_user:securepassword@localhost:5432/game_store` | PostgreSQL connection string |
| `SECRET_KEY` | `super-secret-jwt-key-change-in-production` | JWT signing key |
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL (frontend) |

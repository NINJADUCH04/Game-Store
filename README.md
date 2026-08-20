# Digital Game Store - Architecture Overview

A full-stack web application for browsing and purchasing digital games with location-based inventory.

## Architecture

### System Overview

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
| Authentication | JWT (python-jose) | Token-based auth |

## Database

### PostgreSQL

Why PostgreSQL?

I chose PostgreSQL for this project because it’s exceptionally reliable, easy to set up, and scales effortlessly as the platform grows. For a digital game store, data consistency is non-negotiable—orders require strict ACID compliance, foreign key constraints, and accurate price snapshots, all of which PostgreSQL handles out of the box. It offers native UUID support, flexible JSON handling for game metadata, and seamless integration with Python and SQLAlchemy. It is production-ready, widely adopted, and the clear best choice for transactional systems.

SQLite is supported only as a convenience fallback when DATABASE_URL is not configured, mainly for quick local testing. PostgreSQL should be used for normal development and evaluation.

1. **Data Integrity** - Game store requires strict referential integrity (users ↔ orders ↔ products). PostgreSQL's constraint system prevents orphaned records.

2. **JSONB for Metadata** - Product metadata (tags, platforms, requirements) can be stored as JSONB, enabling flexible queries without schema changes.

3. **Concurrency Handling** - Multiple users purchasing simultaneously requires MVCC. PostgreSQL handles concurrent reads/writes without locking.

4. **Geographic Queries** - Location-based product filtering (JO/SA regions) can leverage PostGIS if extended.

5. **Production Readiness** - Battle-tested in e-commerce (Shopify, Spotify). Supports replication, point-in-time recovery, and high availability.

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    description VARCHAR,
    price FLOAT NOT NULL,
    location VARCHAR NOT NULL,  -- 'JO' or 'SA'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    product_title VARCHAR NOT NULL,
    buyer_username VARCHAR NOT NULL,
    unit_price FLOAT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Backend

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app, CORS, routers
│   ├── config.py          # Environment settings
│   ├── database.py        # SQLAlchemy engine/session
│   ├── models.py          # ORM models (User, Product, Order)
│   ├── schemas.py         # Pydantic request/response schemas
│   ├── auth.py            # JWT, password hashing
│   └── routers/
│       ├── __init__.py
│       ├── auth.py        # POST /api/auth/register, /api/auth/login
│       ├── products.py    # GET /api/products
│       └── orders.py      # POST /api/orders, GET /api/orders/{id}
├── scripts/
│   └── import_csv.py      # Data seeding utility
├── data.csv               # Product data
├── requirements.txt       # Python dependencies
└── .env.example           # Environment template
```

### API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create user account |
| POST | `/api/auth/login` | No | Get JWT token |
| GET | `/api/products` | Yes | List products (paginated, filterable by location) |
| GET | `/api/products/{id}` | Yes | Get product details |
| POST | `/api/orders` | Yes | Create order |
| GET | `/api/orders/{id}` | Yes | Get order details |

### Authentication Flow

```
1. Register → POST /api/auth/register
   Body: { username, email, password }
   Returns: { id, username, email, created_at }

2. Login → POST /api/auth/login
   Body: { username, password } (form-urlencoded)
   Returns: { access_token, token_type }

3. Protected Requests
   Header: Authorization: Bearer <token>
```

## Frontend

### Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   ├── page.tsx            # Redirects to /products
│   │   ├── login/page.tsx      # Login form
│   │   ├── register/page.tsx   # Registration form
│   │   ├── products/
│   │   │   ├── page.tsx        # Product listing
│   │   │   └── [id]/page.tsx   # Product details
│   │   └── receipt/
│   │       └── [id]/page.tsx   # Order receipt
│   ├── components/
│   │   └── Navbar.tsx          # Navigation bar
│   ├── context/
│   │   └── AuthContext.tsx     # Auth state management
│   └── services/
│       └── api.ts              # Axios instance with interceptors
├── package.json
├── next.config.ts
└── tsconfig.json
```

### Key Features

- **Server-Side Rendering** - Initial page loads via Next.js SSR
- **Protected Routes** - Client-side auth checks via AuthContext
- **JWT Persistence** - Token stored in localStorage
- **API Interceptor** - Automatic Bearer token injection via Axios

## Security

- **Password Hashing** - bcrypt via pwdlib
- **JWT Tokens** - HS256 signing with configurable expiry (24h default)
- **CORS** - Restricted to `http://localhost:3000`
- **SQL Injection Prevention** - SQLAlchemy ORM parameterized queries
- **Input Validation** - Pydantic schemas enforce types

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
cp .env.example .env  # Configure DATABASE_URL
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
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API URL |

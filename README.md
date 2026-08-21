# Digital Game Store

A full-stack web application for browsing and purchasing digital games with location-based inventory.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│    Database     │
│   (Next.js)     │     │    (FastAPI)    │     │  (PostgreSQL)   │
│   Port 3001     │     │   Port 8000     │     │   Port 5433     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, React 19, TypeScript | SSR/SSG React framework |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| HTTP Client | Axios | API communication with interceptors |
| Backend | FastAPI, Python 3.12 | Async REST API framework |
| ORM | SQLAlchemy 2.0 | Database abstraction |
| Database | PostgreSQL 15+ | Persistent storage with ACID |
| Auth | JWT (python-jose) + pwdlib (bcrypt) | Token-based authentication |
| Migrations | Alembic | Schema versioning |
| Testing | pytest + httpx + pytest-cov | Unit/integration tests |

---

## Why PostgreSQL

I chose PostgreSQL for this project because it's exceptionally reliable, easy to set up, and scales effortlessly as the platform grows. For a digital game store, data consistency is non-negotiable—orders require strict ACID compliance, foreign key constraints, and accurate price snapshots, all of which PostgreSQL handles out of the box. It offers native UUID support, flexible JSON handling for game metadata, and seamless integration with Python and SQLAlchemy. It is production-ready, widely adopted, and the clear best choice for transactional systems.

SQLite is supported only as a convenience fallback when DATABASE_URL is not configured, mainly for quick local testing. PostgreSQL should be used for normal development and evaluation.

---

## Project Structure

```
fs-sde-assignment/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── auth.py          # JWT creation/validation, password hashing
│   │   │   ├── config.py        # Pydantic BaseSettings (env vars)
│   │   │   ├── database.py      # SQLAlchemy engine, session, get_db
│   │   │   ├── models.py        # ORM models: User, Product, Order
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   ├── routers/
│   │   │   ├── auth.py          # POST /api/auth/register, /api/auth/login
│   │   │   ├── products.py      # GET /api/products, GET /api/products/{id}
│   │   │   └── orders.py        # POST /api/orders, GET /api/orders/{id}
│   │   ├── services/
│   │   │   ├── auth_service.py  # Registration + authentication logic
│   │   │   ├── product_service.py # Product listing + retrieval logic
│   │   │   └── order_service.py # Order creation + retrieval logic
│   │   └── main.py              # FastAPI app, CORS, routers, health check
│   ├── alembic/                 # Database migration scripts
│   ├── tests/
│  
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx       # Root layout with AuthProvider
│   │   │   ├── page.tsx         # Redirects to /products
│   │   │   ├── login/page.tsx   # Login form
│   │   │   ├── register/page.tsx # Registration form
│   │   │   ├── products/
│   │   │   │   ├── page.tsx     # Product listing with pagination
│   │   │   │   └── [id]/page.tsx # Product detail + purchase
│   │   │   └── receipt/
│   │   │       └── [id]/page.tsx # Order confirmation
│   │   ├── components/Navbar.tsx
│   │   ├── context/AuthContext.tsx
│   │   └── services/api.ts      # Axios instance with JWT interceptor
│   ├── package.json
│   └── tsconfig.json
└── README.md
└── docker-compose.yml

```

---

## Getting Started

### Prerequisites (Docker)

| Requirement | Version | Check |
|-------------|---------|-------|
| Docker | 20+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |

**Docker Permissions (Linux):** If you get `permission denied while trying to connect to the docker API`, run:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Or run all Docker commands with `sudo`:

```bash
sudo docker compose up --build
```

**Docker DNS Error:** If you see `could not translate host name "db" to address`, prune stale networks and rebuild:

```bash
docker network prune -f
docker compose down -v
docker compose up --build
```

### Quick Start (Docker)

```bash
git clone https://github.com/NINJADUCH04/Game-Store.git
cd Game-Store
docker compose up --build
```

This starts everything:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5433

The backend automatically runs migrations and imports product data on startup.

### Stopping (Docker)

```bash
docker compose down -v
```

---

## Manual Setup (Without Docker)

Use this if Docker is unavailable or you prefer to run services natively.

### Prerequisites

| Requirement | Version | Check |
|-------------|---------|-------|
| Python | 3.12+ | `python3 --version` |
| Node.js | 20.9+ | `node --version` |
| PostgreSQL | 15+ | `psql --version` |

### Credentials

All credentials are listed here for reference. Use these exact values during setup:

| Service | Username | Password | Database |
|---------|----------|----------|----------|
| PostgreSQL | `store_user` | `securepassword` | `game_store` |
| JWT Secret | — | `super-secret-jwt-key-change-in-production` | — |

### Step 1 — Database

Start PostgreSQL and create the database and user:

```bash
sudo -u postgres psql -c "CREATE DATABASE game_store;"
sudo -u postgres psql -c "CREATE USER store_user WITH PASSWORD 'securepassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE game_store TO store_user;"
sudo -u postgres psql -c "ALTER DATABASE game_store OWNER TO store_user;"
```

### Step 2 — Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-test.txt

# Create .env file with required variables
cat > .env << 'EOF'
DATABASE_URL=postgresql://store_user:securepassword@localhost:5432/game_store
SECRET_KEY=super-secret-jwt-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
EOF

# Run migrations
alembic upgrade head

# Import product data from CSV
python scripts/import_csv.py

# Start the backend server
uvicorn app.main:app --reload --port 8000
```

Backend is now running at http://localhost:8000. Verify with:

```bash
curl http://localhost:8000/health
```

### Step 3 — Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the development server
npm run dev
```

Frontend is now running at http://localhost:3001.

### Step 4 — Verify

1. Open http://localhost:3001 in your browser
2. You should see the login page
3. Register a new account, sign in, and browse products
4. API docs available at http://localhost:8000/docs

## Using the Application

### Register a New Account

1. Open `http://localhost:3001` in your browser
2. You will be redirected to `/login` (the landing page)
3. Click **"Sign Up"** or navigate to `http://localhost:3001/register`
4. Fill in the form:
   - **Username**: your desired username
   - **Email**: your email address
   - **Password**: your password
5. Click **"Sign Up"**
6. You will be redirected to `/login`

### Sign In

1. Navigate to `http://localhost:3001/login`
2. Enter your **username** and **password**
3. Click **"Sign In"**
4. You will be redirected to `/products` — the product catalog
5. Your JWT token is stored in `localStorage` and attached to all API requests automatically

### Browse Products

- The `/products` page shows a paginated list of games
- Use the **location filter** (JO / SA) to filter by region
- Use **pagination controls** to navigate between pages
- Click a product to view its detail page

### Purchase a Game

1. On a product detail page (`/products/{id}`), click **"Buy"**
2. An order is created with the current user, product, and price snapshot
3. You are redirected to the **receipt page** (`/receipt/{id}`) showing order details

### Sign Out

- Click **"Logout"** in the navigation bar
- Your token is cleared and you are redirected to `/login`

---

## API Reference

Full interactive documentation with request/response schemas is available at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Endpoints

**Authentication**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create user account |
| POST | `/api/auth/login` | Get JWT token |

**Products**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (paginated) |
| GET | `/api/products/{id}` | Get product details |

**Orders**
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders/{id}` | Get order (own orders only) |

**System**
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |

### Query Parameters

**`GET /api/products`**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `page_size` | int | 10 | Items per page (max 100) |
| `location` | string | — | Filter by region: `JO` or `SA` |

Example: `GET /api/products?page=1&page_size=5&location=JO`

All protected endpoints (Products, Orders) require the `Authorization: Bearer <token>` header.

---

## Testing

### Test Setup

Tests use an **in-memory SQLite database** — no PostgreSQL connection needed. The test suite:

- Creates a fresh database schema before each test
- Tears down after each test for isolation
- Overrides the `get_db` dependency to use the test database
- Provides fixtures for authenticated users, products, and orders

### Running Tests

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Run all tests with coverage
pytest

# Run with verbose output
pytest -v

# Run a specific test file
pytest tests/test_auth.py

# Run a specific test class
pytest tests/test_auth.py::TestRegister

# Run a specific test
pytest tests/test_auth.py::TestRegister::test_register_success

# Generate HTML coverage report
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### Test Configuration

`pytest.ini` at `backend/pytest.ini`:
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = --cov=app --cov-report=term-missing
```

Coverage runs automatically on every `pytest` invocation.

### Test Coverage

```
97% coverage — 30 tests, 7 lines uncovered
```

| Module | Coverage | Uncovered Lines |
|--------|----------|-----------------|
| `core/auth.py` | 95% | JWT decode edge cases (malformed tokens) |
| `core/database.py` | 64% | `get_db()` generator (tested via dependency override) |
| `core/config.py` | 100% | — |
| `core/models.py` | 100% | — |
| `core/schemas.py` | 100% | — |
| `main.py` | 94% | Lifespan context manager body |
| `routers/*` | 100% | — |
| `services/*` | 100% | — |

### Test Breakdown

| File | Tests | What's Tested |
|------|-------|---------------|
| `test_auth.py` | 11 | Registration success, duplicate username, duplicate email, invalid email format, login success, wrong password, nonexistent user, missing fields, missing token, invalid token, valid token access |
| `test_products.py` | 9 | Empty listing, listing with data, page 2 pagination, filter JO, filter SA, invalid location rejected, unauthorized access, get by ID, get nonexistent product |
| `test_orders.py` | 8 | Create order, product not found, unauthorized create, invalid payload, get order, order not found, cross-user isolation (can't see other users' orders), unauthorized get |
| `test_health.py` | 1 | Health endpoint returns healthy |

---

## Security

| Measure | Implementation |
|---------|---------------|
| Password Hashing | bcrypt via pwdlib (auto salted) |
| JWT Tokens | HS256 signing, 24-hour expiry |
| CORS | Configurable via `CORS_ORIGINS` env var |
| SQL Injection | SQLAlchemy ORM parameterized queries |
| Input Validation | Pydantic schemas enforce types at the API boundary |
| Authorization | Each user can only access their own orders |
| Sensitive Config | `.env` file excluded from git via `.gitignore` |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://store_user:securepassword@localhost:5432/game_store` | PostgreSQL connection string |
| `SECRET_KEY` | `super-secret-jwt-key-change-in-production` | JWT signing key — change in production |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` (24 hours) | Token expiry time |
| `CORS_ORIGINS` | `["http://localhost:3000","http://localhost:3001"]` | Allowed frontend origins |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## Database Migrations

```bash
cd backend

# Create a new migration after model changes
alembic revision --autogenerate -m "description of change"

# Apply pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Show migration history
alembic history
```

---
## 🏗️ Architecture & Structural Decisions

This project was built with a decoupled monorepo architecture designed for clear separation of concerns, high transaction integrity, and modern developer experience.

### Key Architectural Highlights

1. **Monorepo Layout:**
   - Unified `frontend/` (Next.js 15 App Router) and `backend/` (FastAPI) under a single root project, enabling coordinated environment setups and streamlined Docker containerization.

2. **Decoupled Stateless Authentication:**
   - Utilizes OAuth2 with Bearer JWT tokens. The FastAPI backend handles secure password hashing via Bcrypt and stateless token issuance, allowing the Next.js frontend to securely access protected endpoints via Axios request interceptors.

3. **Data Integrity & Snapshot Pattern:**
   - **PostgreSQL Persistence:** Chosen as the primary production database to enforce strict ACID compliance, foreign key constraints, and concurrent transaction safety during checkout.
   - **Price & Order Snapshots:** When an order is placed, the backend stores immutable snapshots of `unit_price`, `product_title`, and `buyer_username` inside the `orders` table. This prevents historical receipt distortion if product titles or prices are updated in the catalog later.
   - **UUID Primary Keys:** Orders utilize `UUIDv4` primary keys to prevent resource enumeration attacks on public receipt URLs (`/receipt/[id]`).

4. **Fallback Database Configuration:**
   - Configured with SQLAlchemy to automatically fall back to SQLite when `DATABASE_URL` is absent, allowing zero-config local development while maintaining full PostgreSQL functionality in production.
   
## Assumptions

| Assumption | Details |
|------------|---------|
| **Port Configuration** | Frontend runs on port 3001 and PostgreSQL on port 5433 to avoid conflicts with locally running services (Node.js dev server on 3000, local PostgreSQL on 5432). These can be changed in `docker-compose.yml`. |
| **Database Credentials** | Default credentials (`store_user` / `securepassword`) are hardcoded in `docker-compose.yml` for development convenience. These must be changed for any production deployment. |
| **JWT Secret** | The default signing key (`super-secret-jwt-key-change-in-production`) is used. This must be replaced with a strong, unique secret in production. |
| **Valid Regions** | Only `JO` (Jordan) and `SA` (Saudi Arabia) are accepted as valid location filters. Products with other or missing location values are treated as global. |
| **Pagination** | The default page size is 10 items per page across all list endpoints (max 100). |
| **Static Assets** | The frontend expects `wallpaperPurple.gif` and `products-wallpaper.jpg` to exist in `frontend/public/`. Missing assets will result in a plain background. |
| **SQLite** | Used exclusively for the test suite via dependency override. Never used for development or production — PostgreSQL is always required for normal operation. |
| **Data Import** | In Docker, `data.csv` is imported into PostgreSQL automatically on startup via the backend entrypoint. For manual setup (without Docker), run `python scripts/import_csv.py` from the `backend/` directory after migrations. The CSV must contain `title`, `description`, `price`, and `location` columns. |
| **Purchase Flow** | Purchases are assumed to succeed immediately. There is no payment gateway integration — clicking "Buy Now" creates the order and records the transaction directly. |

---
## 🔮 Future Roadmap & Enterprise Architecture

To support high-concurrency payment processing, automated billing, and telemetry, the platform architecture will evolve across four core tracks:

* **Payment Infrastructure:** Direct payment gateway integration (Stripe/Adyen) featuring 3D Secure 2.0 (3DS2) authentication, PCI-DSS Level 1 tokenization, and direct issuer authorization flows.
* **Recurring Billing Engine:** Automated recurring billing for gaming passes that automatically retries failed payments, sends customer reminders, and processes instant payment status updates via webhooks.
* **Event-Driven Notifications:** Real-time multi-channel dispatch (WebSockets, AWS SES, Firebase) powered by Redis/Celery for price drops, fulfillment receipts, and restock alerts.
* **Orchestration & Observability:** Deployment onto auto-scaling Kubernetes (k8s) pods with enterprise APM integration (**Dynatrace**) for OpenTelemetry distributed tracing and real-time transaction profiling during peak traffic.
## License

This project is an assessment submission.

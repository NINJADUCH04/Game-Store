from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1. Import routers
from app.routers import auth, products, orders  # Ensure filenames match app/routers/

app = FastAPI(
    title="Digital Game Store API",
    docs_url="/docs",
    redoc_url="/redoc"
)
 
# 2. Add CORS Middleware (Essential for Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Include Routers explicitly
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)

# 4. Debug helper to print loaded routes
@app.on_event("startup")
def print_routes():
    for route in app.routes:
        if hasattr(route, "methods"):
            print(f"REGISTERED ROUTE: {route.path} [{','.join(route.methods)}]")
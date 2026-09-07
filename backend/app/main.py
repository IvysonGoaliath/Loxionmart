from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, users, businesses, services, bookings, orders, admin, catalogue, merchant, saved, media

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("loxionmart")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (safe — won't overwrite existing)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Loxion Mart API started")
    yield
    logger.info("Loxion Mart API shutting down")


app = FastAPI(
    title="Loxion Mart API",
    description="Mzansi's local marketplace — API",
    version="1.0.0",
    lifespan=lifespan,
    # Disable docs in production
    docs_url=None if settings.is_production else "/docs",
    redoc_url=None if settings.is_production else "/redoc",
)

# ── CORS ──
allowed_origins = [
    settings.public_frontend_url,
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ──
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

# ── Routers ──
app.include_router(auth.router,       prefix="/api")
app.include_router(users.router,      prefix="/api")
app.include_router(businesses.router, prefix="/api")
app.include_router(services.router,   prefix="/api")
app.include_router(bookings.router,   prefix="/api")
app.include_router(orders.router,     prefix="/api")
app.include_router(admin.router,      prefix="/api")

for mall_router in (catalogue.router, merchant.router, saved.router, media.router):
    app.include_router(mall_router, prefix="/api")

@app.get("/api/mall-config")
def mall_config():
    return {"payments_enabled": settings.PAYMENTS_ENABLED}

# ── Health check ──
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "app": "Loxion Mart",
        "environment": settings.ENVIRONMENT,
    }

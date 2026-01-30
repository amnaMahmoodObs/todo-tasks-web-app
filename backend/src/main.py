"""
FastAPI application entry point.

This module initializes the FastAPI application, configures CORS,
registers middleware, and mounts API routers.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.db import create_db_and_tables
from src.middleware.jwt_middleware import JWTMiddleware
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Todo App API",
    description="Multi-user todo application with JWT authentication",
    version="0.1.0",
)

# CORS configuration
allowed_origins = [
    "http://localhost:3000",  # Development frontend
    settings.FRONTEND_URL,  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # Required for HTTP-only cookies
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,  # Preflight cache duration (10 minutes)
)

# Add JWT authentication middleware
app.add_middleware(JWTMiddleware)

logger.info(f"CORS configured for origins: {allowed_origins}")


@app.on_event("startup")
async def on_startup():
    """
    Application startup event handler.

    Creates database tables if they don't exist.
    """
    logger.info("Starting application...")
    try:
        create_db_and_tables()
        logger.info("Database tables created/verified successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {str(e)}")
        raise


@app.get("/")
async def root():
    """
    Root endpoint for API health check.

    Returns:
        dict: API status and version information
    """
    return {
        "status": "ok",
        "message": "Todo App API is running",
        "version": "0.1.0",
    }


@app.get("/health")
async def health():
    """
    Health check endpoint.

    Returns:
        dict: Health status
    """
    return {"status": "healthy"}


# Import and register routers
from src.routes.auth import router as auth_router
from src.routes.tasks import router as tasks_router

app.include_router(auth_router)
app.include_router(tasks_router)

logger.info("FastAPI application initialized successfully")

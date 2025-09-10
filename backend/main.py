from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.core.config import settings
from app.api.v1.merge import router as merge_router
from app.api.v1.split import router as split_router  # Add this import

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    debug=settings.DEBUG
)

# CORS Configuration from settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(merge_router, prefix=settings.API_V1_STR)
app.include_router(split_router, prefix=settings.API_V1_STR)  # Add this line

@app.get("/")
def read_root():
    logger.info("Root endpoint was hit.")
    return {"message": f"{settings.PROJECT_NAME} Backend is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "debug_mode": settings.DEBUG}

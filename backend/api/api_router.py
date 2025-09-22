from fastapi import APIRouter

# Import routers correctly
try:
    from .routes import merge, split, compress, project_exporter
except ImportError:
    # For absolute imports when running directly
    from api.routes import merge, split, compress, project_exporter

api_router = APIRouter()

api_router.include_router(merge.router, prefix="/merge", tags=["Merge"])
api_router.include_router(split.router, prefix="/split", tags=["Split"])
api_router.include_router(compress.router, prefix="/compress", tags=["Compress"])
api_router.include_router(project_exporter.router, prefix="/project-exporter", tags=["Project Exporter"])

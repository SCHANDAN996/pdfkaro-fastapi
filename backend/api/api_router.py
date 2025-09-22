from fastapi import APIRouter
from .routes import merge, split, compress, project_exporter

api_router = APIRouter()

# सभी टूल राउटर्स को एक मुख्य राउटर में शामिल करें
api_router.include_router(merge.router, prefix="/merge", tags=["Merge"])
api_router.include_router(split.router, prefix="/split", tags=["Split"])
api_router.include_router(compress.router, prefix="/compress", tags=["Compress"])
api_router.include_router(project_exporter.router, prefix="/project-exporter", tags=["Project Exporter"])

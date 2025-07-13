from fastapi import APIRouter
from app.services.pdf_service import merge_pdfs
from pydantic import BaseModel

class MergeRequest(BaseModel):
    file_paths: list

router = APIRouter()

@router.post("/")
async def merge(request: MergeRequest):
    result = merge_pdfs(request.file_paths)
    return {"message": "PDFs merged successfully", "data": result}

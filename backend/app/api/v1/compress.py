from fastapi import APIRouter
from app.services.pdf_service import compress_pdf
from pydantic import BaseModel

class CompressRequest(BaseModel):
    file_path: str  # Path to the PDF file to compress
    size_percentage: int  # Percentage by which to compress the file

router = APIRouter()

@router.post("/")
async def compress(request: CompressRequest):
    result = compress_pdf(request.file_path, request.size_percentage)
    return {"message": "PDF compressed successfully", "data": result}

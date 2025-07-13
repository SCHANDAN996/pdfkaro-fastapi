# backend/app/api/v1/split.py
from fastapi import APIRouter
from app.services.pdf_service import split_pdf
from pydantic import BaseModel

class SplitRequest(BaseModel):
    file_path: str  # Path to the PDF file to split
    start_page: int  # Start page for split
    end_page: int  # End page for split

router = APIRouter()

@router.post("/")
async def split(request: SplitRequest):
    result = split_pdf(request.file_path, request.start_page, request.end_page)
    return {"message": "PDF split successfully", "data": result}

# backend/app/api/v1/ocr.py
from fastapi import APIRouter
from app.services.pdf_service import ocr_pdf
from pydantic import BaseModel

class OcrRequest(BaseModel):
    file_path: str  # Path to the PDF or Image file to extract text from

router = APIRouter()

@router.post("/")
async def ocr(request: OcrRequest):
    result = ocr_pdf(request.file_path)
    return {"message": "OCR processing successful", "data": result}

import io
from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
import logging
from app.services.pdf_processor import pdf_processor

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    try:
        # Use the PDF processor service
        merged_pdf_bytes = await pdf_processor.merge_pdfs(files)
        
        # Create response
        return StreamingResponse(
            io.BytesIO(merged_pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged_by_PDFkaro.in.pdf"}
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Unexpected error in merge endpoint: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during PDF merging")

@router.options("/merge")
async def options_merge():
    return {"message": "ok"}

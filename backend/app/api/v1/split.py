import io
import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, Query
from fastapi.responses import StreamingResponse
from app.services.pdf_processor import pdf_processor

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/split")
async def split_pdf(
    file: UploadFile = File(..., description="PDF file to split"),
    pages: str = Query("all", description="Page ranges to extract (e.g., '1-3,5,7-9') or 'all' for all pages")
):
    """
    Split a PDF file into multiple files based on page ranges
    """
    logger.info(f"Received file: {file.filename} for splitting with pages: {pages}")
    
    try:
        # Read file content
        content = await file.read()
        
        # Process the PDF
        if pages.lower() == "all":
            # Extract all pages as individual PDFs
            result = await pdf_processor.extract_all_pages(content, file.filename)
        else:
            # Extract specific page ranges
            result = await pdf_processor.extract_page_ranges(content, pages, file.filename)
        
        # Return the zip file
        return StreamingResponse(
            io.BytesIO(result),
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=split_pdf_files.zip"}
        )
        
    except ValueError as e:
        logger.error(f"Invalid page range: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid page range: {str(e)}")
    except Exception as e:
        logger.error(f"Error splitting PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Error splitting PDF: {str(e)}")

@router.options("/split")
async def options_split():
    return {"message": "ok"}

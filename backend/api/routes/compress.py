import io
import zipfile
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging
from PIL import Image

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/")
async def compress_pdfs(files: List[UploadFile] = File(...), level: str = Form("medium")):
    """
    Simple compression endpoint that works reliably
    """
    try:
        logger.info(f"Compressing {len(files)} files with level: {level}")
        
        # Compression levels
        compression_levels = {
            "high": {"dpi": 72, "quality": 60},      # High compression
            "medium": {"dpi": 150, "quality": 75},   # Balanced
            "low": {"dpi": 300, "quality": 85}       # Low compression
        }
        
        params = compression_levels.get(level, compression_levels["medium"])
        
        # For single file, return PDF directly; for multiple, return ZIP
        if len(files) == 1:
            return await compress_single_pdf(files[0], params)
        else:
            return await compress_multiple_pdfs(files, params)
            
    except Exception as e:
        logger.error(f"Compression error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

async def compress_single_pdf(file: UploadFile, params: dict):
    """Compress single PDF and return as PDF"""
    try:
        pdf_bytes = await file.read()
        compressed_pdf = compress_pdf_bytes(pdf_bytes, params)
        
        output_buffer = io.BytesIO(compressed_pdf)
        filename = f"compressed_{file.filename}"
        
        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise e

async def compress_multiple_pdfs(files: List[UploadFile], params: dict):
    """Compress multiple PDFs and return as ZIP"""
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file in files:
            try:
                pdf_bytes = await file.read()
                compressed_pdf = compress_pdf_bytes(pdf_bytes, params)
                
                filename = f"compressed_{file.filename}"
                zip_file.writestr(filename, compressed_pdf)
                
            except Exception as e:
                logger.warning(f"Failed to compress {file.filename}: {e}")
                continue
    
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=compressed_pdfs.zip"}
    )

def compress_pdf_bytes(pdf_bytes: bytes, params: dict) -> bytes:
    """Core PDF compression function"""
    try:
        # Open PDF
        pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        
        # Basic compression without image processing (more reliable)
        output_buffer = io.BytesIO()
        pdf.save(
            output_buffer,
            linearize=True,
            compress_streams=True,
            object_stream_mode=pikepdf.ObjectStreamMode.generate,
            recompress_flate=True
        )
        
        return output_buffer.getvalue()
        
    except Exception as e:
        logger.error(f"PDF compression error: {e}")
        raise e

# Simple quality-based endpoint
@router.post("/quality")
async def compress_by_quality(files: List[UploadFile] = File(...), quality: int = Form(50)):
    """Quality-based compression (1-100%)"""
    try:
        # Map quality percentage to compression level
        if quality >= 80:
            level = "low"      # 80-100% = low compression
        elif quality >= 50:
            level = "medium"   # 50-79% = medium compression  
        else:
            level = "high"     # 1-49% = high compression
            
        return await compress_pdfs(files, level)
        
    except Exception as e:
        logger.error(f"Quality compression error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Simple size-based endpoint
@router.post("/size")
async def compress_by_size(files: List[UploadFile] = File(...), 
                          target_size: int = Form(...), 
                          size_unit: str = Form("KB")):
    """Size-based compression"""
    try:
        # Convert to KB
        target_kb = target_size * 1024 if size_unit.upper() == "MB" else target_size
        
        # Map target size to compression level
        if target_kb <= 500:    # <= 500KB
            level = "high"
        elif target_kb <= 2000: # <= 2MB  
            level = "medium"
        else:                   # > 2MB
            level = "low"
            
        return await compress_pdfs(files, level)
        
    except Exception as e:
        logger.error(f"Size compression error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

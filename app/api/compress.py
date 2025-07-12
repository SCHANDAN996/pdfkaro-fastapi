from fastapi import HTTPException
from app.utils.file_handler import compress_pdf

async def compress_pdf(file: str, compression_level: int):
    try:
        compressed_pdf = compress_pdf(file, compression_level)
        return {"message": "PDF compressed successfully", "compressed_pdf": compressed_pdf}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error compressing PDF: {str(e)}")

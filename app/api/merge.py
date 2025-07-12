from fastapi import HTTPException
from app.utils.file_handler import merge_pdfs

async def merge_pdfs(files: list):
    try:
        output_pdf = merge_pdfs(files)
        return {"message": "PDFs merged successfully", "output_pdf": output_pdf}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error merging PDFs: {str(e)}")

from fastapi import HTTPException
from app.utils.file_handler import merge_pdfs, generate_pdf_preview
from app.utils.preview_utils import create_pdf_preview

async def merge_pdfs(files: list, preview: bool = False):
    try:
        # PDF Merge
        output_pdf = merge_pdfs(files)
        
        # Generate Preview if enabled
        if preview:
            preview_image = create_pdf_preview(output_pdf)  # Generate preview of merged PDF
        
        return {
            "message": "PDFs merged successfully",
            "output_pdf": output_pdf,
            "preview_image": preview_image if preview else None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error merging PDFs: {str(e)}")

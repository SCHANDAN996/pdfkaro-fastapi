from fastapi import HTTPException
from app.utils.file_handler import convert_pdf

async def convert_pdf(file: str, target_format: str):
    try:
        converted_file = convert_pdf(file, target_format)
        return {"message": f"PDF converted to {target_format} successfully", "converted_file": converted_file}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error converting PDF: {str(e)}")

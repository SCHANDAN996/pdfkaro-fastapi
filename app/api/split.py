from fastapi import HTTPException
from ..utils.file_handler import split_pdf

async def split_pdf(file: str, page_number: int):
    try:
        split_output = split_pdf(file, page_number)
        return {"message": "PDF split successfully", "split_pdf": split_output}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error splitting PDF: {str(e)}")

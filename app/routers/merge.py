from fastapi import APIRouter, UploadFile, File
from typing import List
import fitz  # PyMuPDF
import io
from starlette.responses import StreamingResponse

router = APIRouter()

@router.post("/api/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    merger = fitz.open()
    for file in files:
        contents = await file.read()
        pdf = fitz.open(stream=contents, filetype="pdf")
        merger.insert_pdf(pdf)
    output = io.BytesIO()
    merger.save(output)
    output.seek(0)
    return StreamingResponse(output, media_type="application/pdf")

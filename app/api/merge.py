from fastapi import APIRouter, UploadFile
from PyPDF2 import PdfMerger

router = APIRouter()

@router.post("/merge")
async def merge_pdfs(files: list[UploadFile]):
    merger = PdfMerger()
    for file in files:
        merger.append(file.file)
    merger.write("merged.pdf")
    return {"output": "merged.pdf"}

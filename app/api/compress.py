from fastapi import APIRouter, UploadFile
import subprocess

router = APIRouter()

@router.post("/compress")
async def compress_pdf(file: UploadFile, quality: int = 50):
    # Ghostscript का उपयोग करें
    subprocess.run(["gs", "-sDEVICE=pdfwrite", f"-dPDFSETTINGS=/{quality}", "-o", "compressed.pdf", file.file])
    return {"output": "compressed.pdf"}

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import fitz, uuid, os
from app.routers import merge  # to access templates

router = APIRouter()

@router.get("/compress")
def compress_page(request):
    return request.app.templates.TemplateResponse("compress.html", {"request": request})

@router.post("/api/compress")
async def compress_pdf(file: UploadFile = File(...)):
    tmp = f"temp_{file.filename}"
    contents = await file.read()
    with open(tmp, "wb") as f:
        f.write(contents)
    doc = fitz.open(tmp)
    output = f"compressed_{uuid.uuid4().hex}.pdf"
    doc.save(output, garbage=4, deflate=True)
    doc.close()
    os.remove(tmp)
    return FileResponse(output, filename="compressed.pdf")

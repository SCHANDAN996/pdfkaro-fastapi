from fastapi import APIRouter, Request, UploadFile, File
from fastapi.responses import FileResponse
import fitz
import uuid, os

router = APIRouter()

@router.get("/merge")
def merge_page(request: Request):
    return request.app.templates.TemplateResponse("merge.html", {"request": request})

@router.post("/api/merge")
async def merge_pdf(files: list[UploadFile] = File(...)):
    output_filename = f"merged_{uuid.uuid4().hex}.pdf"
    merged_doc = fitz.open()
    for file in files:
        contents = await file.read()
        tmp = f"temp_{file.filename}"
        with open(tmp, "wb") as f:
            f.write(contents)
        temp_doc = fitz.open(tmp)
        merged_doc.insert_pdf(temp_doc)
        temp_doc.close()
        os.remove(tmp)
    merged_doc.save(output_filename)
    merged_doc.close()
    return FileResponse(output_filename, filename="merged.pdf")

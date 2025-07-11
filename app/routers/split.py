from fastapi import APIRouter, Request, UploadFile, File, Form
from fastapi.responses import FileResponse
import fitz, uuid, os

router = APIRouter()

@router.get("/split")
def split_page(request: Request):
    return request.app.templates.TemplateResponse("split.html", {"request": request})

@router.post("/api/split")
async def split_pdf(file: UploadFile = File(...), start: int = Form(...), end: int = Form(...)):
    contents = await file.read()
    tmp = f"temp_{file.filename}"
    with open(tmp, "wb") as f:
        f.write(contents)
    doc = fitz.open(tmp)
    new_doc = fitz.open()
    for i in range(start-1, end):
        new_doc.insert_pdf(doc, from_page=i, to_page=i)
    output = f"split_{uuid.uuid4().hex}.pdf"
    new_doc.save(output)
    doc.close()
    new_doc.close()
    os.remove(tmp)
    return FileResponse(output, filename="split.pdf")

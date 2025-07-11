from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
import fitz  # PyMuPDF
import shutil
import os

router = APIRouter()

@router.post("/api/merge")
async def merge_pdfs(files: list[UploadFile] = File(...)):
    output = fitz.open()
    for f in files:
        with open(f.filename, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
        src = fitz.open(f.filename)
        output.insert_pdf(src)
        src.close()
        os.remove(f.filename)

    output_path = "merged_output.pdf"
    output.save(output_path)
    return FileResponse(output_path, media_type="application/pdf", filename=output_path)


# 📄 app/routers/split.py
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import FileResponse

router = APIRouter()

@router.post("/api/split")
async def split_pdf(file: UploadFile = File(...), from_page: int = Form(...), to_page: int = Form(...)):
    with open(file.filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = fitz.open(file.filename)
    split = fitz.open()
    split.insert_pdf(doc, from_page=from_page-1, to_page=to_page-1)

    out_path = "split_output.pdf"
    split.save(out_path)
    doc.close()
    os.remove(file.filename)
    return FileResponse(out_path, media_type="application/pdf", filename=out_path)


# 📄 app/routers/compress.py
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse

router = APIRouter()

@router.post("/api/compress")
async def compress_pdf(file: UploadFile = File(...)):
    with open(file.filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    doc = fitz.open(file.filename)
    for page in doc:
        img_list = page.get_images(full=True)
        for img in img_list:
            xref = img[0]
            doc[xref] = doc.extract_image(xref)["image"]  # Not full compression, but we optimize

    output_path = "compressed_output.pdf"
    doc.save(output_path, garbage=4, deflate=True)
    doc.close()
    os.remove(file.filename)
    return FileResponse(output_path, media_type="application/pdf", filename=output_path)


# 📄 app/main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request

from app.routers import merge, split, compress

app = FastAPI()

app.include_router(merge.router)
app.include_router(split.router)
app.include_router(compress.router)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="app/templates")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

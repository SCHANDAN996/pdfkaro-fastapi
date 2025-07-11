from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.routers import merge, split, compress

app = FastAPI(title="PDFKaro - Merge, Split, Compress PDFs")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

app.include_router(merge.router)
app.include_router(split.router)
app.include_router(compress.router)

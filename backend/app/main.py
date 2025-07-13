# backend/app/main.py
from fastapi import FastAPI
from app.api.v1 import merge, compress, ocr, split

app = FastAPI()

# Include API routers
app.include_router(merge.router, prefix="/v1/merge", tags=["Merge"])
app.include_router(compress.router, prefix="/v1/compress", tags=["Compress"])
app.include_router(ocr.router, prefix="/v1/ocr", tags=["OCR"])
app.include_router(split.router, prefix="/v1/split", tags=["Split"])

@app.get("/")
def read_root():
    return {"message": "Welcome to PDFkaro.in API!"}

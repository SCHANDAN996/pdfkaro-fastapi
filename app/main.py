from fastapi import FastAPI
from app.api import merge, split, compress, convert, watermark, ocr
import sys
from pathlib import Path

# प्रोजेक्ट रूट को Python पाथ में जोड़ें
sys.path.append(str(Path(__file__).parent.parent))
app = FastAPI()

# Define the routes for each tool
@app.post("/merge-pdf/")
async def merge_pdf(files: list):
    return await merge.merge_pdfs(files)

@app.post("/split-pdf/")
async def split_pdf(file: str, page_number: int):
    return await split.split_pdf(file, page_number)

@app.post("/compress-pdf/")
async def compress_pdf(file: str, compression_level: int):
    return await compress.compress_pdf(file, compression_level)

@app.post("/convert-pdf/")
async def convert_pdf(file: str, target_format: str):
    return await convert.convert_pdf(file, target_format)

@app.post("/watermark-pdf/")
async def watermark_pdf(file: str, watermark_text: str):
    return await watermark.add_watermark(file, watermark_text)

@app.post("/ocr-pdf/")
async def ocr_pdf(file: str):
    return await ocr.perform_ocr(file)

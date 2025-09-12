import io
import json
import zipfile
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging

# ... (Logging, FastAPI App, CORS setup - sab pehle jaisa)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI(title="PDFkaro.in Backend")
origins = ["*"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.options("/api/v1/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return {"message": "ok"}

@app.get("/")
def read_root():
    return {"message": "PDFkaro.in Backend is running!"}

# --- Merge PDF (Pehle jaisa) ---
@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...), pages_data: str = Form(...)):
    # ... (Merge logic pehle jaisa hi hai)
    try:
        page_instructions = json.loads(pages_data)
        file_map = {file.filename: await file.read() for file in files}
        open_pdfs = {filename: pikepdf.Pdf.open(io.BytesIO(data)) for filename, data in file_map.items()}
        merged_pdf = pikepdf.Pdf.new()
        for instruction in page_instructions:
            source_filename, page_index, rotation = instruction['sourceFile'], instruction['pageIndex'], instruction.get('rotation', 0)
            if source_filename in open_pdfs:
                page = open_pdfs[source_filename].pages[page_index]
                if rotation != 0: page.rotate(rotation, relative=True)
                merged_pdf.pages.append(page)
        output_buffer = io.BytesIO()
        merged_pdf.save(output_buffer)
        output_buffer.seek(0)
        return StreamingResponse(output_buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=merged_by_PDFkaro.in.pdf"})
    except Exception as e:
        logger.error(f"Error merging: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# --- NAYA ENDPOINT: Sabhi pages ko ZIP me split karne ke liye ---
@app.post("/api/v1/split-all")
async def split_all_pages(file: UploadFile = File(...)):
    logger.info(f"Splitting all pages for file: {file.filename}")
    try:
        pdf_bytes = await file.read()
        source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w') as zip_file:
            for i, page in enumerate(source_pdf.pages):
                dst = pikepdf.Pdf.new()
                dst.pages.append(page)
                page_buffer = io.BytesIO()
                dst.save(page_buffer)
                page_buffer.seek(0)
                zip_file.writestr(f"page_{i+1}_by_PDFkaro.in.pdf", page_buffer.getvalue())
        
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=split_pages_by_PDFkaro.in.zip"}
        )
    except Exception as e:
        logger.error(f"Error splitting all pages: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# --- NAYA ENDPOINT: Sirf ek page ko download karne ke liye ---
@app.post("/api/v1/extract-single-page")
async def extract_single_page(file: UploadFile = File(...), page_number: int = Form(...)):
    logger.info(f"Extracting page {page_number} from file: {file.filename}")
    try:
        pdf_bytes = await file.read()
        source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))

        if 0 <= page_number < len(source_pdf.pages):
            new_pdf = pikepdf.Pdf.new()
            new_pdf.pages.append(source_pdf.pages[page_number])
            
            output_buffer = io.BytesIO()
            new_pdf.save(output_buffer)
            output_buffer.seek(0)
            
            filename = f"page_{page_number+1}_by_PDFkaro.in.pdf"
            return StreamingResponse(
                output_buffer,
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        else:
            raise HTTPException(status_code=400, detail="Invalid page number.")
    except Exception as e:
        logger.error(f"Error extracting single page: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

import io
import json
import zipfile
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="PDFkaro.in Backend")

# CORS Configuration
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/api/v1/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return {"message": "ok"}

@app.get("/")
def read_root():
    return {"message": "PDFkaro.in Backend is running!"}

@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...), pages_data: str = Form(...)):
    logger.info(f"Received {len(files)} files for merging.")
    try:
        page_instructions = json.loads(pages_data)
        file_map = {file.filename: await file.read() for file in files}
        open_pdfs = {filename: pikepdf.Pdf.open(io.BytesIO(data)) for filename, data in file_map.items()}
        merged_pdf = pikepdf.Pdf.new()
        for instruction in page_instructions:
            source_filename = instruction['sourceFile']
            page_index = instruction['pageIndex']
            rotation = instruction.get('rotation', 0)
            if source_filename in open_pdfs:
                source_pdf = open_pdfs[source_filename]
                page = source_pdf.pages[page_index]
                if rotation != 0:
                    page.rotate(rotation, relative=True)
                merged_pdf.pages.append(page)
        for pdf in open_pdfs.values():
            pdf.close()
        output_buffer = io.BytesIO()
        merged_pdf.save(output_buffer)
        output_buffer.seek(0)
        branded_filename = "merged_by_PDFkaro.in.pdf"
        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={branded_filename}"}
        )
    except Exception as e:
        logger.error(f"Error during merging: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

# --- YEH NAYA SPLIT/EXTRACT API ENDPOINT HAI ---
@app.post("/api/v1/split")
async def split_pdf(file: UploadFile = File(...), pages_to_extract: str = Form(...)):
    logger.info(f"Received file '{file.filename}' for splitting/extraction.")
    try:
        # User ne kaun se page chune hain, uski list
        selected_pages_indices = json.loads(pages_to_extract)
        pdf_bytes = await file.read()
        source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        
        # Agar user ne page chune hain, to unhe extract karo
        if selected_pages_indices:
            new_pdf = pikepdf.Pdf.new()
            for index in selected_pages_indices:
                if 0 <= index < len(source_pdf.pages):
                    new_pdf.pages.append(source_pdf.pages[index])
            
            output_buffer = io.BytesIO()
            new_pdf.save(output_buffer)
            output_buffer.seek(0)
            filename = "extracted_pages_by_PDFkaro.in.pdf"
            media_type = "application/pdf"
        
        # Agar user ne koi page nahi chuna, to sabhi ko split karo
        else:
            output_buffer = io.BytesIO()
            with zipfile.ZipFile(output_buffer, 'w') as zip_file:
                for i, page in enumerate(source_pdf.pages):
                    dst = pikepdf.Pdf.new()
                    dst.pages.append(page)
                    
                    page_buffer = io.BytesIO()
                    dst.save(page_buffer)
                    page_buffer.seek(0)
                    zip_file.writestr(f"page_{i+1}_by_PDFkaro.in.pdf", page_buffer.getvalue())
            
            output_buffer.seek(0)
            filename = "split_files_by_PDFkaro.in.zip"
            media_type = "application/zip"

        return StreamingResponse(
            output_buffer,
            media_type=media_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except Exception as e:
        logger.error(f"Error during splitting: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

import io
import logging
from typing import List

import pikepdf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, StreamingResponse

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="PDFkaro.in Backend")

# --- CORS Configuration ---
# Allow all origins to ensure connectivity.
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"], # Allow OPTIONS method
    allow_headers=["*"],
)

# --- Explicit OPTIONS route for preflight requests ---
# Yeh browser ke security guard (preflight request) ko handle karega
@app.options("/api/v1/merge")
async def merge_options():
    logger.info("Received OPTIONS request for /api/v1/merge")
    return Response(status_code=200)

@app.get("/")
def read_root():
    logger.info("Root endpoint was hit.")
    return {"message": "PDFkaro.in Backend is running!"}

@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    logger.info(f"SUCCESS: Received {len(files)} files for merging.")
    try:
        merged_pdf = pikepdf.Pdf.new()

        for file in files:
            pdf_bytes = await file.read()
            try:
                src_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
                merged_pdf.pages.extend(src_pdf.pages)
            except Exception as e:
                logger.warning(f"Skipping corrupted file {file.filename}: {e}")
                
        output_buffer = io.BytesIO()
        merged_pdf.save(output_buffer)
        output_buffer.seek(0)
        logger.info("PDFs merged successfully. Sending response.")

        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged_document.pdf"}
        )
    except Exception as e:
        logger.error(f"An unexpected error occurred during merging: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


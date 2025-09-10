import io
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging
from app.api.v1.split import router as split_router

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="PDFkaro.in Backend")

# --- CORS Configuration ---
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- OPTIONS Route for Preflight Requests ---
@app.options("/api/v1/merge")
async def options_merge():
    return {"message": "ok"}

@app.get("/")
def read_root():
    logger.info("Root endpoint was hit.")
    return {"message": "PDFkaro.in Backend is running!"}

@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    logger.info(f"Received {len(files)} files for merging.")
    try:
        merged_pdf = pikepdf.Pdf.new()
        for file in files:
            logger.info(f"Processing file: {file.filename}")
            pdf_bytes = await file.read()
            try:
                src_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
                merged_pdf.pages.extend(src_pdf.pages)
            except Exception as individual_file_error:
                logger.error(f"Could not process file {file.filename}: {individual_file_error}")
        
        output_buffer = io.BytesIO()
        merged_pdf.save(output_buffer)
        output_buffer.seek(0)
        logger.info("PDFs merged successfully. Sending response.")

        # --- YEH HAMARA BADLAV HAI ---
        # Humne yahan filename ko badal diya hai
        branded_filename = "merged_by_PDFkaro.in.pdf"

        return StreamingResponse(
            output_buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={branded_filename}"}
        )
    except Exception as e:
        logger.error(f"An unexpected error occurred during merging: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


# Add this after the merge router inclusion
app.include_router(split_router, prefix=settings.API_V1_STR)


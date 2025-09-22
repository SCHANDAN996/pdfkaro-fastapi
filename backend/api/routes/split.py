import io
import json
import zipfile
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import pikepdf
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/")
async def split_pdf(file: UploadFile = File(...), pages_to_extract: str = Form(...)):
    try:
        page_instructions = json.loads(pages_to_extract)
        logger.info(f"Page instructions for split: {page_instructions}")
        pdf_bytes = await file.read()
        source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        output_buffer = io.BytesIO()

        if page_instructions:
            new_pdf = pikepdf.Pdf.new()
            for instruction in page_instructions:
                index = instruction['pageIndex']
                rotation = instruction.get('rotation', 0)
                if 0 <= index < len(source_pdf.pages):
                    page = source_pdf.pages[index]
                    if rotation != 0:
                        page.rotate(rotation, relative=True)
                    new_pdf.pages.append(page)
            new_pdf.save(output_buffer)
            filename = "extracted_pages_by_PDFkaro.in.pdf"
            media_type = "application/pdf"
        else:
            with zipfile.ZipFile(output_buffer, 'w') as zf:
                for i, page in enumerate(source_pdf.pages):
                    dst = pikepdf.Pdf.new()
                    dst.pages.append(page)
                    page_buffer = io.BytesIO()
                    dst.save(page_buffer)
                    page_buffer.seek(0)
                    zf.writestr(f"page_{i+1}.pdf", page_buffer.getvalue())
            filename = "split_files_by_PDFkaro.in.zip"
            media_type = "application/zip"
        
        output_buffer.seek(0)
        return StreamingResponse(output_buffer, media_type=media_type, headers={"Content-Disposition": f"attachment; filename={filename}"})
    except Exception as e:
        logger.error(f"Error during splitting: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error during PDF splitting process.")

@router.post("/extract-single-page")
async def extract_single_page(file: UploadFile = File(...), page_number: int = Form(...)):
    try:
        pdf_bytes = await file.read()
        source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        if 0 <= page_number < len(source_pdf.pages):
            new_pdf = pikepdf.Pdf.new()
            new_pdf.pages.append(source_pdf.pages[page_number])
            output_buffer = io.BytesIO()
            new_pdf.save(output_buffer)
            output_buffer.seek(0)
            filename = f"page_{page_number + 1}_by_PDFkaro.in.pdf"
            return StreamingResponse(output_buffer, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={filename}"})
        else:
            raise HTTPException(status_code=400, detail="Invalid page number.")
    except Exception as e:
        logger.error(f"Error extracting single page: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error extracting single page.")

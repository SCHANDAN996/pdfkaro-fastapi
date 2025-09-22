import io
import json
import zipfile
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List, Dict
from PIL import Image
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Helper functions (ये फंक्शन केवल इसी फाइल में रहेंगे)
def _compose_pdf_from_instructions(pages_data: str, file_map: dict) -> pikepdf.Pdf:
    page_instructions = json.loads(pages_data)
    open_pdfs = {filename: pikepdf.Pdf.open(io.BytesIO(data)) for filename, data in file_map.items()}
    composed_pdf = pikepdf.Pdf.new()
    for instruction in page_instructions:
        source_filename = instruction['sourceFile']
        page_index = instruction['pageIndex']
        rotation = instruction.get('rotation', 0)
        if source_filename in open_pdfs:
            source_pdf = open_pdfs[source_filename]
            page = source_pdf.pages[page_index]
            if rotation != 0:
                page.rotate(rotation, relative=True)
            composed_pdf.pages.append(page)
    for pdf in open_pdfs.values():
        pdf.close()
    return composed_pdf

def _compress_pdf_images(pdf: pikepdf.Pdf, target_dpi: int, jpeg_quality: int):
    for page in pdf.pages:
        for key in list(page.images.keys()):
            try:
                raw_image = pikepdf.Raw(page.images[key])
                pil_image = Image.open(io.BytesIO(raw_image.data))
                pil_image.thumbnail((pil_image.width * target_dpi / 72, pil_image.height * target_dpi / 72))
                img_byte_arr = io.BytesIO()
                pil_image.save(img_byte_arr, format='JPEG', quality=jpeg_quality, optimize=True)
                page.images[key].write(img_byte_arr.getvalue(), stream_decode_parameters=None)
            except Exception as e:
                logger.warning(f"Could not compress an image: {e}")
                continue
    return pdf

@router.post("/quality")
async def compress_by_quality(files: List[UploadFile] = File(...), pages_data: str = Form(...), quality: float = Form(0.5)):
    logger.info(f"Compressing with quality: {quality}")
    try:
        file_map = {file.filename: await file.read() for file in files}
        composed_pdf = _compose_pdf_from_instructions(pages_data, file_map)
        target_dpi = 72 + (quality * (300 - 72))
        jpeg_quality = int(30 + (quality * 60))
        compressed_pdf = _compress_pdf_images(composed_pdf, target_dpi, jpeg_quality)
        output_buffer = io.BytesIO()
        compressed_pdf.save(output_buffer, linearize=True, compress_streams=True)
        output_buffer.seek(0)
        return StreamingResponse(output_buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/size")
async def compress_to_size(files: List[UploadFile] = File(...), pages_data: str = Form(...), target_size_kb: int = Form(...)):
    logger.info(f"Compressing to target size: ~{target_size_kb} KB")
    try:
        file_map = {file.filename: await file.read() for file in files}
        composed_pdf_obj = _compose_pdf_from_instructions(pages_data, file_map)
        
        max_size_bytes = target_size_kb * 1024
        presets = [{'dpi': 300, 'quality': 90}, {'dpi': 150, 'quality': 85}, {'dpi': 100, 'quality': 75}, {'dpi': 72, 'quality': 50}]
        best_result_buffer = io.BytesIO()
        composed_pdf_obj.save(best_result_buffer)
        
        for preset in presets:
            temp_pdf_bytes = best_result_buffer.getvalue()
            if len(temp_pdf_bytes) <= max_size_bytes:
                break
            temp_pdf = pikepdf.Pdf.open(io.BytesIO(temp_pdf_bytes))
            compressed_pdf = _compress_pdf_images(temp_pdf, preset['dpi'], preset['quality'])
            best_result_buffer = io.BytesIO()
            compressed_pdf.save(best_result_buffer, linearize=True, compress_streams=True)
        
        best_result_buffer.seek(0)
        return StreamingResponse(best_result_buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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

# Helper function to create a single PDF from page instructions
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

# Helper function to compress images within a pikepdf object
def _compress_pdf_images(pdf: pikepdf.Pdf, target_dpi: int, jpeg_quality: int):
    for page in pdf.pages:
        for key in list(page.images.keys()):
            try:
                image_obj = page.images[key]
                raw_image = pikepdf.Raw(image_obj)
                pil_image = Image.open(io.BytesIO(raw_image.data))
                
                pil_image.thumbnail((
                    pil_image.width * target_dpi / pil_image.info.get('dpi', (72, 72))[0],
                    pil_image.height * target_dpi / pil_image.info.get('dpi', (72, 72))[1]
                ))
                
                img_byte_arr = io.BytesIO()
                pil_image.save(img_byte_arr, format='JPEG', quality=jpeg_quality, optimize=True)
                
                new_image_obj = pikepdf.Image(img_byte_arr)
                image_obj.write(new_image_obj.data, stream_decode_parameters=None)
            except Exception:
                continue
    return pdf

@router.post("/quality")
async def compose_and_compress_pdfs(files: List[UploadFile] = File(...), pages_data: str = Form(...), quality: float = Form(0.5)):
    logger.info(f"Composing and compressing with quality: {quality}")
    try:
        file_map = {file.filename: await file.read() for file in files}
        composed_pdf = _compose_pdf_from_instructions(pages_data, file_map)
        target_dpi = 72 + (quality * (300 - 72))
        jpeg_quality = int(30 + (quality * 60))
        compressed_pdf = _compress_pdf_images(composed_pdf, target_dpi, jpeg_quality)
        output_buffer = io.BytesIO()
        compressed_pdf.save(output_buffer, linearize=True, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
        output_buffer.seek(0)
        return StreamingResponse(output_buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error during PDF processing.")

@router.post("/size")
async def compress_to_target_size(files: List[UploadFile] = File(...), pages_data: str = Form(...), target_size_kb: int = Form(100)):
    logger.info(f"Compressing to target size: ~{target_size_kb} KB")
    try:
        file_map = {file.filename: await file.read() for file in files}
        composed_pdf_obj = _compose_pdf_from_instructions(pages_data, file_map)
        composed_pdf_bytes = io.BytesIO()
        composed_pdf_obj.save(composed_pdf_bytes)
        composed_pdf_bytes.seek(0)
        
        max_size_bytes = target_size_kb * 1024
        presets = [{'dpi': 300, 'quality': 90}, {'dpi': 150, 'quality': 85}, {'dpi': 100, 'quality': 75}, {'dpi': 72,  'quality': 50}]
        best_result_buffer = None

        for preset in presets:
            temp_pdf = pikepdf.Pdf.open(io.BytesIO(composed_pdf_bytes.getvalue()))
            compressed_pdf = _compress_pdf_images(temp_pdf, preset['dpi'], preset['quality'])
            output_buffer = io.BytesIO()
            compressed_pdf.save(output_buffer, linearize=True, compress_streams=True)
            current_size_bytes = output_buffer.tell()
            if best_result_buffer is None: best_result_buffer = output_buffer
            if current_size_bytes <= max_size_bytes:
                best_result_buffer = output_buffer
                logger.info(f"Found suitable compression at {preset['dpi']} DPI. Size: {current_size_bytes / 1024:.2f} KB")
                break
            else:
                best_result_buffer = output_buffer
        
        best_result_buffer.seek(0)
        return StreamingResponse(best_result_buffer, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error during target size PDF compression.")

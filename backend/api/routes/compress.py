import io
import zipfile
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging
from PIL import Image

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/")
async def compress_pdfs(files: List[UploadFile] = File(...), level: str = Form("recommended")):
    logger.info(f"Received {len(files)} files for compression with level: {level}")
    
    dpi_map = { "low": 300, "recommended": 150, "high": 72 }
    target_dpi = dpi_map.get(level, 150)

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file in files:
            try:
                pdf_bytes = await file.read()
                source_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
                
                for page in source_pdf.pages:
                    for key, image_obj in page.images.items():
                        try:
                            raw_image = pikepdf.Raw(image_obj)
                            pil_image = Image.open(io.BytesIO(raw_image.data))
                            
                            pil_image.thumbnail((pil_image.width * target_dpi / pil_image.info.get('dpi', (72,72))[0], 
                                                 pil_image.height * target_dpi / pil_image.info.get('dpi', (72,72))[1]))
                            
                            img_byte_arr = io.BytesIO()
                            pil_image.save(img_byte_arr, format='JPEG', quality=85, optimize=True)
                            
                            new_image_obj = pikepdf.Image(img_byte_arr)
                            image_obj.write(new_image_obj.data, stream_decode_parameters=None)
                            
                        except Exception as img_e:
                            logger.warning(f"Could not compress an image in {file.filename}: {img_e}")
                            continue

                output_pdf_buffer = io.BytesIO()
                source_pdf.save(output_pdf_buffer, linearize=True, compress_streams=True, object_stream_mode=pikepdf.ObjectStreamMode.generate)
                output_pdf_buffer.seek(0)
                
                base_name = file.filename.rsplit('.', 1)[0]
                compressed_filename = f"{base_name}_compressed.pdf"
                
                zip_file.writestr(compressed_filename, output_pdf_buffer.getvalue())

            except Exception as pdf_e:
                logger.error(f"Failed to process file {file.filename}: {pdf_e}")
                continue

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=compressed_by_PDFkaro.in.zip"}
    )

# Simple quality-based compression endpoint
@router.post("/quality")
async def compress_by_quality(files: List[UploadFile] = File(...), quality: int = Form(50)):
    try:
        # For now, use the existing compression logic with quality mapping
        quality_map = {
            100: "low",
            75: "recommended", 
            50: "recommended",
            25: "high"
        }
        level = quality_map.get(quality, "recommended")
        
        # Call the main compression function
        return await compress_pdfs(files, level)
        
    except Exception as e:
        logger.error(f"Error in quality-based compression: {e}")
        raise HTTPException(status_code=500, detail="Compression failed")

# Simple size-based compression endpoint  
@router.post("/size")
async def compress_by_size(files: List[UploadFile] = File(...), target_size_kb: int = Form(1024)):
    try:
        # Map target size to compression level
        if target_size_kb <= 512:  # 512KB or less
            level = "high"
        elif target_size_kb <= 1024:  # 1MB or less
            level = "recommended"
        else:  # More than 1MB
            level = "low"
            
        # Call the main compression function
        return await compress_pdfs(files, level)
        
    except Exception as e:
        logger.error(f"Error in size-based compression: {e}")
        raise HTTPException(status_code=500, detail="Compression failed")

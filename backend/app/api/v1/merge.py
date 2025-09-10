from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import Response
from typing import List
from app.services.pdf_processor import PDFProcessor, pdf_processor_service

# प्रत्येक टूल के लिए एक अलग राउटर बनाना कोड को मॉड्यूलर और व्यवस्थित रखता है।
router = APIRouter()

@router.post("/merge", 
    summary="Merge Multiple PDFs",
    description="Upload multiple PDF files to combine them into a single document."
)
async def merge_pdfs_endpoint(
    files: List[UploadFile] = File(..., description="List of PDF files to merge."),
    pdf_processor: PDFProcessor = Depends(lambda: pdf_processor_service)
):
    """
    कई PDF फाइलों को एक में मर्ज करने के लिए API एंडपॉइंट।
    यह `PDFProcessor` सेवा का उपयोग करके वास्तविक तर्क को संभालता है।
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files were uploaded.")

    for file in files:
        if file.content_type!= "application/pdf":
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid file type: {file.filename}. Only PDF files are allowed."
            )

    try:
        merged_pdf_bytes = await pdf_processor.merge_pdfs(files)
        
        return Response(
            content=merged_pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=merged_document.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during merging: {str(e)}")

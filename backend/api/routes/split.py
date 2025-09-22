import io
import json
import zipfile
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/split")
async def split_pdf(file: UploadFile = File(...), pages_to_extract: str = Form(...)):
    # ... (split_pdf का पूरा लॉजिक यहाँ कॉपी करें)
    pass

@router.post("/extract-single-page")
async def extract_single_page(file: UploadFile = File(...), page_number: int = Form(...)):
    # ... (extract_single_page का पूरा लॉजिक यहाँ कॉपी करें)
    pass

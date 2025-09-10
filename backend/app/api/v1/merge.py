import io
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import pikepdf
from typing import List

# FastAPI ऐप को शुरू करें
app = FastAPI(title="PDFkaro.in Backend")

# CORS को कॉन्फ़िगर करें ताकि हमारा फ्रंटएंड कनेक्ट हो सके
# यह बहुत ज़रूरी है
origins = [
    "https://pdfkaro.in",
    "https://www.pdfkaro.in",
    "https://pdfkaro-frontend.onrender.com",
    "http://localhost:3000", # Local development के लिए
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# यह एक साधारण रूट है यह चेक करने के लिए कि API चल रहा है या नहीं
@app.get("/")
def read_root():
    return {"message": "PDFkaro.in Backend is running!"}

# यह मुख्य API एंडपॉइंट है जो PDF फाइलों को मर्ज करेगा
@app.post("/api/v1/merge")
async def merge_pdfs(files: List[UploadFile] = File(...)):
    # एक खाली PDF बनाएं जिसमें हम सभी पेजों को डालेंगे
    merged_pdf = pikepdf.Pdf.new()

    # हर अपलोड की गई PDF फाइल को प्रोसेस करें
    for file in files:
        # अपलोड की गई फाइल को मेमोरी में पढ़ें
        pdf_bytes = await file.read()
        # मेमोरी से PDF को खोलें
        src_pdf = pikepdf.Pdf.open(io.BytesIO(pdf_bytes))
        # उस PDF के सभी पेजों को हमारी खाली PDF में जोड़ें
        merged_pdf.pages.extend(src_pdf.pages)

    # मर्ज की गई PDF को मेमोरी में सेव करें
    output_buffer = io.BytesIO()
    merged_pdf.save(output_buffer)
    output_buffer.seek(0)

    # मेमोरी से PDF को स्ट्रीम करें और फाइल को डाउनलोड के लिए भेजें
    return StreamingResponse(
        output_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=merged_document.pdf"}
    )


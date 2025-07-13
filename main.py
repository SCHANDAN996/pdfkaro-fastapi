from fastapi import FastAPI

# FastAPI एप्लिकेशन की शुरुआत
app = FastAPI()

# एक साधारण रूट जिसे वेब ब्राउज़र या API क्लाइंट द्वारा एक्सेस किया जा सकता है
@app.get("/")
def read_root():
    return {"message": "Welcome to PDFkaro.in API!"}

# एक और उदाहरण रूट, जो GET और POST दोनों प्रकार की रिक्वेस्ट को हैंडल करेगा
@app.get("/hello/{name}")
def read_hello(name: str):
    return {"message": f"Hello, {name}!"}

@app.post("/process-pdf/")
async def process_pdf(file: bytes):
    # यहाँ पर PDF प्रोसेसिंग का कोड आएगा
    return {"message": "PDF processed successfully!"}

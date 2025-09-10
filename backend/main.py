from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import merge  # अन्य टूल राउटर्स को यहाँ आयात करें

# यह मुख्य एप्लिकेशन फ़ाइल है।
# यह FastAPI ऐप को इनिशियलाइज़ करती है, मिडलवेयर सेट करती है, और सभी टूल राउटर्स को शामिल करती है।
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS मिडलवेयर सेट करें
# यह आपके React फ्रंटएंड को बैकएंड API से अनुरोध करने की अनुमति देता है।
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# API राउटर्स को शामिल करें
# प्रत्येक टूल का अपना प्रीफिक्स होता है, जो API को व्यवस्थित रखता है।
app.include_router(merge.router, prefix=f"{settings.API_V1_STR}/pdf", tags=)
# app.include_router(compress.router, prefix=f"{settings.API_V1_STR}/pdf", tags=)
# app.include_router(split.router, prefix=f"{settings.API_V1_STR}/pdf", tags=)

@app.get("/", summary="Health Check")
def read_root():
    """
    यह सुनिश्चित करने के लिए एक सरल हेल्थ चेक एंडपॉइंट कि सेवा चल रही है।
    """
    return {"status": "ok", "message": f"Welcome to {settings.PROJECT_NAME}"}

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request

app = FastAPI()

# Serve static files (CSS, JS, Images)
app.mount("/static", StaticFiles(directory="backend/app/static"), name="static")

# Set up Jinja2 for HTML rendering
templates = Jinja2Templates(directory="backend/app/templates")

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

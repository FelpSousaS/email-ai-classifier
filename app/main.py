from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

load_dotenv()

from app.schemas import EmailAnalysisResponse, EmailAnalysisRequest
from app.nlp.preprocess import preprocess_text

app = FastAPI(title="Email AI Classifier")

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="app/templates")


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/analyze", response_model=EmailAnalysisResponse)
def analyze_email(payload: EmailAnalysisRequest):
    preprocessed_text = preprocess_text(payload.text)
    return EmailAnalysisResponse(
        category="Produtivo",
        suggested_reply="Obrigado pelo contato. Em breve retornaremos com mais informações.",
    )

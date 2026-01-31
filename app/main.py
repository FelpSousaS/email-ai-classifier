from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

load_dotenv()

from app.schemas import EmailAnalysisResponse, EmailAnalysisRequest
from app.nlp.preprocess import preprocess_text
from app.services.ai_service_gemini import analyze_email_with_gemini

app = FastAPI(title="Email AI Classifier")

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="app/templates")

USE_AI = False


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.post("/analyze", response_model=EmailAnalysisResponse)
def analyze_email(payload: EmailAnalysisRequest):
    try:

        preprocessed_text = preprocess_text(payload.text)

        ai_result = analyze_email_with_gemini(payload.text)

        return EmailAnalysisResponse(
            category=ai_result["category"],
            suggested_reply=ai_result["suggested_reply"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

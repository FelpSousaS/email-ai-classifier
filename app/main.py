from fastapi import FastAPI, Request, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

load_dotenv()

from app.schemas import EmailAnalysisResponse, EmailAnalysisRequest
from app.nlp.preprocess import preprocess_text
from app.services.ai_service_gemini import analyze_email_with_gemini
from app.utils.file_parser import extract_text_from_pdf, extract_text_from_txt

app = FastAPI(title="Email AI Classifier")

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="app/templates")


@app.get("/", response_class=HTMLResponse)
def landing(request: Request):
    return templates.TemplateResponse("landing.html", {"request": request})


@app.get("/app", response_class=HTMLResponse)
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


@app.post("/analyze-file", response_model=EmailAnalysisResponse)
def analyze_email_file(file: UploadFile = File(...)):
    try:
        if file.filename.endswith(".txt"):
            text = extract_text_from_txt(file)

        elif file.filename.endswith(".pdf"):
            text = extract_text_from_pdf(file)

        else:
            raise HTTPException(
                status_code=400, detail="Formato não suportado! Use .txt ou .pdf"
            )

        preprocessed_text = preprocess_text(text)

        ai_result = analyze_email_with_gemini(text)

        return EmailAnalysisResponse(
            category=ai_result["category"],
            suggested_reply=ai_result["suggested_reply"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

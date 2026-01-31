from fastapi import UploadFile
from pypdf import PdfReader
import io


def extract_text_from_txt(file: UploadFile) -> str:
    content = file.file.read().decode("utf-8")
    return content


def extract_text_from_pdf(file: UploadFile) -> str:
    pdf_bytes = file.file.read()
    reader = PdfReader(io.BytesIO(pdf_bytes))

    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""

    return text

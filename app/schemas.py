from pydantic import BaseModel
from enum import Enum


class EmailCategory(str, Enum):
    PRODUTIVO = "Produtivo"
    IMPRODUTIVO = "Improdutivo"


class EmailAnalysisRequest(BaseModel):
    text: str


class EmailAnalysisResponse(BaseModel):
    category: EmailCategory
    suggested_reply: str

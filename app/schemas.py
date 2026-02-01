from pydantic import BaseModel, Field
from enum import Enum
from typing import List


class EmailCategory(str, Enum):
    PRODUTIVO = "Produtivo"
    IMPRODUTIVO = "Improdutivo"


class EmailAnalysisRequest(BaseModel):
    text: str


class EmailAnalysisResponse(BaseModel):
    category: EmailCategory
    suggested_reply: str
    confidence: int = Field(ge=0, le=100)
    reasons: List[str] = Field(min_length=2, max_length=4)

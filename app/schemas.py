from pydantic import BaseModel


class EmailAnalysisRequest(BaseModel):
    text: str


class EmailAnalysisResponse(BaseModel):
    category: str
    suggested_reply: str

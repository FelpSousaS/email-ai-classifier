from pydantic import BaseModel


class EmailAnalysisRequestt(BaseModel):
    text: str


class EmailAnalysisResponse(BaseModel):
    category: str
    suggested_reply: str

from pydantic import BaseModel


class EmailAnalysisResponse(BaseModel):
    categoria: str
    resposta_sugerida: str

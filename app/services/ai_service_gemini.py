import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_email_with_gemini(text: str) -> dict:

    prompt = f"""
    Você é um assistente especializado em triagem de e-mails corporativos.

    Sua tarefa é:

    1) Classificar o e-mail como:
       - "Produtivo" (requer ação ou resposta)
       - "Improdutivo" (não requer ação)

    2) Gerar uma resposta profissional adequada ao contexto.

    E-mail:
    {text}
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": {
                        "category": {
                            "type": "string",
                            "description": "Produtivo ou Improdutivo",
                        },
                        "suggested_reply": {
                            "type": "string",
                            "description": "Resposta profissional sugerida",
                        },
                    },
                    "required": ["category", "suggested_reply"],
                },
            },
        )

        data = json.loads(response.text)

        return data

    except Exception as e:
        print("Erro ao chamar Gemini:", str(e))
        raise

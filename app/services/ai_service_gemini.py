import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

PROMPT = """
Você é um assistente corporativo de triagem de emails, projetado para operar em um ambiente financeiro com alto volume, necessidade de precisão e baixo risco operacional.

Seu objetivo é apoiar a automação do atendimento, reduzindo esforço humano sem comprometer clareza, segurança ou consistência.

Tarefas obrigatórias:
- Classificar o email como "Produtivo" ou "Improdutivo".
- Atribuir um nível de confiança de 0 a 100, representando a certeza da classificação.
- Explicar a decisão com 2 a 4 motivos objetivos (máx. 12 palavras cada).
- Gerar uma resposta sugerida pronta para envio (copiar e colar).

Definições de categoria:
- Produtivo: emails que requerem uma ação ou resposta específica (ex.: solicitações de suporte técnico, atualização sobre casos em aberto, dúvidas sobre o sistema).
- Improdutivo: email que não exige ação imediata, como felicitações, agradecimentos sem follow-up, mensagens automáticas, propaganda, spam , conteúdo irrelevante ou mensagens incompletas.
- Analise exclusivamente o texto fornecido.
- Ignore assinaturas, rodapés, banners, disclaimers legais, avisos automáticos.
- Em emails encaminhados ou com thread, foque apenas na mensagem mais recente.
- Não utilize conhecimento externo nem presuma acesso a sistemas internos.

Regras de classificação:
- Pedido explícito de status, envio, suporte, validação, correção ou informação => Produtivo.
- Pedido implícito só conta quando houver solicitação concreta de ação ou informação.
- Expressões de cortesia sem pedido claro não caracterizam solicitação.
- Em caso de dúvida real, classifique como Produtivo e reduza a confiança.

Confiança (0–100):
- 90–100: intenção inequívoca.
- 70–89: intenção clara, poucos detalhes ausentes.
- 50–69: sinais mistos.
- 0–49: contexto insuficiente.
- Evite variações pequenas sem diferença clara no conteúdo.

Motivos:
- 2 a 4 motivos.
- Máximo 12 palavras cada.
- Baseados em evidências do texto.

Resposta sugerida:
- Deve estar pronta para copiar e colar.
- Linguagem profissional, neutra e clara.
- Para Produtivo: confirmar recebimento, referenciar pedido e indicar próximo passo seguro.
- Para Improdutivo: resposta curta e educada.
- Não prometer prazos, valores ou resultados.
- Sem emojis ou informalidade.

Assinatura padrão:
Equipe de Atendimento | Setor Financeiro
"""

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "category": {"type": "string", "enum": ["Produtivo", "Improdutivo"]},
        "confidence": {"type": "integer", "minimum": 0, "maximum": 100},
        "reasons": {
            "type": "array",
            "minItems": 2,
            "maxItems": 4,
            "items": {"type": "string"},
        },
        "suggested_reply": {"type": "string"},
    },
    "required": ["category", "confidence", "reasons", "suggested_reply"],
}


def analyze_email_with_gemini(text: str) -> dict:
    prompt = f"""{PROMPT}

Email para análise:
\"\"\"{text}\"\"\"
"""

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": RESPONSE_SCHEMA,
            },
        )

        data = json.loads(response.text)

        if isinstance(data.get("category"), str):
            data["category"] = data["category"].strip()

        if isinstance(data.get("suggested_reply"), str):
            data["suggested_reply"] = (
                data["suggested_reply"].replace("\r\n", "\n").strip()
            )

        if isinstance(data.get("reasons"), list):
            data["reasons"] = [r.strip() for r in data["reasons"] if r.strip()]

        return data

    except Exception as e:
        print("Erro ao chamar Gemini:", str(e))
        raise

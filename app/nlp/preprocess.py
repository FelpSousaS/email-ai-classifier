import re
import spacy

# modelo de português
nlp = spacy.load("pt_core_news_sm")


# Realiza o pré-processamento NLP do texto(remoção de caracteres especiais, stopwords...)
def preprocess_text(text: str) -> str:

    text = text.lower()
    text = re.sub(r"[^a-záàâãéèêíïóôõöúçñ\s]", "", text)

    doc = nlp(text)

    processed_tokens = []

    for token in doc:
        if not token.is_stop and not token.is_punct:
            processed_tokens.append(token.lemma_)

    return " ".join(processed_tokens)

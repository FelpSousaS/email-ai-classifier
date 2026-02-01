# 📧 Email AI Classifier

Aplicação web que utiliza **Inteligência Artificial** para **classificar emails corporativos** como **Produtivos** ou **Improdutivos** e **sugerir respostas automáticas**, com foco em **ambientes financeiros de alto volume**.

O objetivo é **automatizar a triagem inicial de emails**, reduzindo esforço manual da equipe e melhorando eficiência operacional.

---

## 🚀 Visão Geral da Solução

A aplicação permite que o usuário:

- Cole o texto de um email **ou**
- Faça upload de um arquivo `.txt` ou `.pdf`

E receba como resultado:

- ✅ **Classificação do email** (Produtivo / Improdutivo)
- 📊 **Nível de confiança da classificação**
- 🧠 **Motivos objetivos da decisão**
- ✉️ **Resposta automática sugerida**, pronta para envio

A interface foi pensada para ser **simples, intuitiva e acessível**, incluindo:
- Dark / Light mode
- Validações de entrada
- Feedback visual de processamento
- Tratamento de erros inline

---

## 🧱 Arquitetura da Aplicação

### Frontend
- HTML5 + CSS3 (layout responsivo)
- JavaScript Vanilla
- Dark mode em arquivo próprio
- Validações no cliente (tipo de arquivo, conteúdo vazio, UX de processamento)

### Backend
- Python
- API de IA (Google Gemini)
- Prompt estruturado para classificação confiável
- Retorno padronizado (`category`, `confidence`, `reasons`, `suggested_reply`)

### Integração
- Comunicação via `fetch`
- Endpoints distintos para texto e arquivo
- Respostas em JSON

---

## 🛠️ Tecnologias Utilizadas

- **Python 3.10+**
- **Google Gemini API**
- HTML / CSS / JavaScript
- `python-dotenv`
- Ambiente virtual (`venv`)

---

## 📦 Pré-requisitos

Antes de rodar o projeto localmente, você precisa ter:

- Python **3.10 ou superior**
- Git
- Conta Google com acesso à **Gemini API**

---

## ⚙️ Como Rodar o Projeto Localmente

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seu-usuario/email-ai-classifier.git
cd email-ai-classifier
```

2️⃣ Criar e ativar o ambiente virtual
Linux / macOS
```bash
python -m venv .venv
source .venv/bin/activate
```

Windows
```bash
python -m venv .venv
.venv\Scripts\activate
```

3️⃣ Instalar as dependências
```bash
pip install -r requirements.txt
```

4️⃣ Configurar variáveis de ambiente (`.env`)

Crie um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:

```bash
GEMINI_API_KEY=SUA_CHAVE_DA_API
```

🔑 Como gerar a chave da API Gemini

- Acesse: https://ai.google.dev/

- Crie uma chave de API

- Copie e cole no arquivo `.env`

5️⃣ Executar a aplicação

```bash
uvicorn app.main:app --reload
```

6️⃣ Acessar no navegador

Landing page:
👉 http://localhost:8000

Aplicação principal:
👉 http://localhost:8000/app

Documentação dos endpoints:
👉 http://localhost:8000/docs

## 🧪 Validações Implementadas

- ✅ Arquivos fora do padrão .txt ou .pdf são bloqueados no upload

- ✅ Arquivos vazios não são processados

- ✅ Evita chamadas desnecessárias à API de IA

- ✅ Mensagens de erro exibidas inline

## 🎨 Interface e Experiência do Usuário

- Layout responsivo

- Dark / Light mode persistido

- Feedback visual de processamento

- Estados claros (vazio, processando, resultado)

- Copy-to-clipboard da resposta sugerida

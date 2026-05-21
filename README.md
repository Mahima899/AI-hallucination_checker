# ⚡ TruthLens — AI Hallucination Checker

An AI-powered bilingual fact-checking web app that detects hallucinations 
in AI-generated text using real-time web search and LLaMA 3.3.

## ✨ Features
- ✅ Detects TRUE / FALSE / PARTIALLY TRUE statements
- 🌐 Real-time web search verification (Tavily API)
- 🤖 Powered by Groq's LLaMA 3.3 70B model
- 🗣️ Tamil & English bilingual support
- 🎙️ Voice input support
- 📊 Confidence score with visual bar
- 🔍 Key claims breakdown + corrections
- 📜 MySQL-backed check history
- 🗑 Delete / Clear all history

## 🛠️ Tech Stack
- **Frontend:** React.js, CSS3, Web Speech API
- **Backend:** Python, FastAPI, Uvicorn
- **AI:** Groq API (LLaMA 3.3 70B), Tavily Search API
- **Database:** MySQL

## 🚀 Setup

### 1. Database
```sql
mysql -u root -p < backend/schema.sql
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Add GROQ_API_KEY, TAVILY_API_KEY, DB credentials
uvicorn main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
```

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /check | Fact-check a statement |
| GET | /history | Get check history |
| DELETE | /history/all | Clear all history |
| DELETE | /history/{id} | Delete one item |

## 👩‍💻 Author
**Mahima P** — Full Stack Developer

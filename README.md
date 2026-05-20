# ⚡ TruthLens — AI Hallucination Checker

An AI-powered fact-checking web app that detects hallucinations in AI-generated text using Groq's LLaMA 3 model.

## Features
- ✅ Detects TRUE / FALSE / PARTIALLY TRUE statements
- 📊 Confidence score with visual bar
- 🔍 Key claims breakdown
- ✏️ Corrections for false statements
- 📜 MySQL-backed check history
- 🗑 Delete history entries

## Tech Stack
- **Frontend:** React
- **Backend:** Python + FastAPI
- **AI:** Groq API (LLaMA 3)
- **Database:** MySQL

## Setup

### 1. Database
```sql
mysql -u root -p < backend/schema.sql
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GROQ_API_KEY and MySQL credentials
uvicorn main:app --reload
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
```

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /check | Check a statement |
| GET | /history | Get check history |
| DELETE | /history/{id} | Delete a history item |

## Author
Mahima P
"# AI-hallucination_checker" 

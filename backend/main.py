from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from tavily import TavilyClient
import mysql.connector
import os
import json
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AI Hallucination Checker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "hallucination_checker")
    )

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

class CheckRequest(BaseModel):
    text: str
    lang: str = "en"

class CheckResponse(BaseModel):
    verdict: str
    confidence: int
    explanation: str
    key_claims: list[str]
    corrections: str | None
    sources: list[str] | None

@app.get("/")
def root():
    return {"message": "AI Hallucination Checker API running!"}

@app.post("/check", response_model=CheckResponse)
def check_hallucination(req: CheckRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    today = datetime.now().strftime("%A, %B %d, %Y")

    try:
        search_results = tavily.search(query=req.text, max_results=3)
        sources = [r["url"] for r in search_results.get("results", [])]
        search_context = "\n".join([
            f"- {r['title']}: {r['content'][:200]}"
            for r in search_results.get("results", [])
        ])
    except Exception:
        sources = []
        search_context = "No web search results available."

    lang_instruction = "Respond entirely in Tamil language (தமிழில் மட்டும் பதில் தாருங்கள்)." if req.lang == "ta" else "Respond in English."

    prompt = f"""You are a fact-checking AI. Today's date is {today}. {lang_instruction}

First understand what the user is claiming, even if it's incomplete or a question.
Then verify it using the web search results.

User Input: "{req.text}"

Web Search Results:
{search_context}

Based on today's date ({today}) and web search results, respond ONLY in this exact JSON format (no extra text):
{{
  "verdict": "TRUE" or "FALSE" or "PARTIALLY TRUE",
  "confidence": <number 0-100>,
  "explanation": "<clear explanation based on today's date and web results, in the specified language>",
  "key_claims": ["<claim 1>", "<claim 2>", "<claim 3>"],
  "corrections": "<corrected version if false or partial, else null>"
}}"""

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=800,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()
        result = json.loads(raw)
        result["sources"] = sources

        try:
            db = get_db()
            cursor = db.cursor()
            cursor.execute("""
                INSERT INTO checks (input_text, verdict, confidence, explanation, corrections, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (req.text, result["verdict"], result["confidence"], result["explanation"], result.get("corrections"), datetime.now()))
            db.commit()
            cursor.close()
            db.close()
        except Exception as db_err:
            print(f"DB Error: {db_err}")

        return CheckResponse(**result)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI response parsing failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/history")
def get_history(limit: int = 20):
    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)
        cursor.execute("SELECT id, input_text, verdict, confidence, explanation, corrections, created_at FROM checks ORDER BY created_at DESC LIMIT %s", (limit,))
        rows = cursor.fetchall()
        cursor.close()
        db.close()
        for row in rows:
            if row["created_at"]:
                row["created_at"] = str(row["created_at"])
        return {"history": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/history/all")
def clear_all_history():
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM checks")
        db.commit()
        cursor.close()
        db.close()
        return {"message": "All history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/history/{check_id}")
def delete_history(check_id: int):
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute("DELETE FROM checks WHERE id = %s", (check_id,))
        db.commit()
        cursor.close()
        db.close()
        return {"message": "Deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
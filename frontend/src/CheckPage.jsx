import { useState, useEffect, useRef } from "react";
import "./CheckPage.css";

const TRANSLATIONS = {
  en: {
    title: "Is it", highlight: "actually", titleEnd: "true?",
    subtitle: "Paste any AI-generated text and find out if it's factual.",
    tryExample: "Try an example:",
    placeholder: "Paste any statement or AI-generated text here...",
    chars: "chars", checkBtn: "Check Now →",
    explanation: "📋 Explanation", keyClaims: "🔍 Key Claims Analyzed",
    correction: "✏️ Correction", confidence: "Confidence",
    error: "Something went wrong. Make sure backend is running!",
  },
  ta: {
    title: "இது", highlight: "உண்மையா", titleEnd: "இருக்கா?",
    subtitle: "எந்த AI-generated text-ஐயும் paste பண்ணி உண்மையா இருக்கான்னு கண்டுபிடிங்க.",
    tryExample: "உதாரணம் பாருங்க:",
    placeholder: "எந்த statement-ஐயும் இங்க paste பண்ணுங்க...",
    chars: "எழுத்துகள்", checkBtn: "சரிபார்க்க →",
    explanation: "📋 விளக்கம்", keyClaims: "🔍 முக்கிய கூற்றுகள்",
    correction: "✏️ திருத்தம்", confidence: "நம்பகத்தன்மை",
    error: "பிழை ஏற்பட்டது. Backend running-ஆ இருக்கான்னு பாருங்க!",
  }
};

const EXAMPLES = {
  en: [
    "The Great Wall of China is visible from space with the naked eye.",
    "Albert Einstein failed mathematics in school.",
    "Python was created by Guido van Rossum in 1991.",
  ],
  ta: [
    "சீனப் பெரும் சுவர் விண்வெளியிலிருந்து கண்ணால் பார்க்க முடியும்.",
    "ஐன்ஸ்டீன் பள்ளியில் கணிதத்தில் தோல்வியடைந்தார்.",
    "2026-ல் தமிழ்நாட்டின் முதலமைச்சர் மு.க.ஸ்டாலின்.",
  ]
};

const verdictColor = { TRUE: "#00c896", FALSE: "#ff4d6d", "PARTIALLY TRUE": "#f4a261" };
const verdictIcon = { TRUE: "✅", FALSE: "❌", "PARTIALLY TRUE": "⚠️" };
const verdictLabel = {
  en: { TRUE: "TRUE", FALSE: "FALSE", "PARTIALLY TRUE": "PARTIALLY TRUE" },
  ta: { TRUE: "உண்மை", FALSE: "பொய்", "PARTIALLY TRUE": "பகுதி உண்மை" },
};

export default function CheckPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState("en");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang === "ta" ? "ta-IN" : "en-US";
    recognition.onresult = (e) => { setText(e.results[0][0].transcript); setListening(false); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
  }, [lang]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return alert("Voice not supported in this browser!");
    if (listening) { recognitionRef.current.stop(); setListening(false); }
    else { recognitionRef.current.start(); setListening(true); }
  };

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true); setResult(null); setError("");
    try {
      const res = await fetch("http://localhost:8000/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });
      if (!res.ok) throw new Error("Server error");
      setResult(await res.json());
    } catch (e) {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="check-page">
      <div className="lang-toggle">
        <button className={`lang-btn ${lang === "en" ? "active" : ""}`} onClick={() => setLang("en")}>EN</button>
        <button className={`lang-btn ${lang === "ta" ? "active" : ""}`} onClick={() => setLang("ta")}>தமிழ்</button>
      </div>

      <div className="hero">
        <h1 className="hero-title">{t.title} <span className="highlight">{t.highlight}</span> {t.titleEnd}</h1>
        <p className="hero-sub">{t.subtitle}</p>
      </div>

      <div className="examples">
        <span className="examples-label">{t.tryExample}</span>
        {EXAMPLES[lang].map((ex, i) => (
          <button key={i} className="example-chip" onClick={() => setText(ex)}>{ex.substring(0, 40)}...</button>
        ))}
      </div>

      <div className="input-card">
        <textarea className="text-input" placeholder={t.placeholder} value={text} onChange={(e) => setText(e.target.value)} rows={5} />
        <div className="input-footer">
          <span className="char-count">{text.length} {t.chars}</span>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className={`voice-btn ${listening ? "listening" : ""}`} onClick={toggleVoice}>
              {listening ? "⏹ Stop" : "🎙️"}
            </button>
            <button className="check-btn" onClick={handleCheck} disabled={loading || !text.trim()}>
              {loading ? <span className="spinner" /> : t.checkBtn}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className="result-card" style={{ borderColor: verdictColor[result.verdict] }}>
          <div className="verdict-badge" style={{ background: verdictColor[result.verdict] }}>
            {verdictIcon[result.verdict]} {verdictLabel[lang][result.verdict]}
          </div>
          <div className="confidence-bar-wrap">
            <span className="conf-label">{t.confidence}: {result.confidence}%</span>
            <div className="confidence-bar">
              <div className="confidence-fill" style={{ width: `${result.confidence}%`, background: verdictColor[result.verdict] }} />
            </div>
          </div>
          <div className="section"><h3>{t.explanation}</h3><p>{result.explanation}</p></div>
          <div className="section">
            <h3>{t.keyClaims}</h3>
            <ul>{result.key_claims.map((claim, i) => <li key={i}>{claim}</li>)}</ul>
          </div>
          {result.corrections && (
            <div className="section corrections"><h3>{t.correction}</h3><p>{result.corrections}</p></div>
          )}
        </div>
      )}
    </div>
  );
}
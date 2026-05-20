import { useState } from "react";
import "./CheckPage.css";

const EXAMPLES = [
  "The Great Wall of China is visible from space with the naked eye.",
  "Albert Einstein failed mathematics in school.",
  "Python was created by Guido van Rossum in 1991.",
];

export default function CheckPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("http://localhost:8000/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Something went wrong. Make sure backend is running!");
    } finally {
      setLoading(false);
    }
  };

  const verdictColor = {
    TRUE: "#00c896",
    FALSE: "#ff4d6d",
    "PARTIALLY TRUE": "#f4a261",
  };

  const verdictIcon = {
    TRUE: "✅",
    FALSE: "❌",
    "PARTIALLY TRUE": "⚠️",
  };

  return (
    <div className="check-page">
      <div className="hero">
        <h1 className="hero-title">Is it <span className="highlight">actually</span> true?</h1>
        <p className="hero-sub">Paste any AI-generated text and find out if it's factual.</p>
      </div>

      <div className="examples">
        <span className="examples-label">Try an example:</span>
        {EXAMPLES.map((ex, i) => (
          <button key={i} className="example-chip" onClick={() => setText(ex)}>
            {ex.substring(0, 40)}...
          </button>
        ))}
      </div>

      <div className="input-card">
        <textarea
          className="text-input"
          placeholder="Paste any statement or AI-generated text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
        />
        <div className="input-footer">
          <span className="char-count">{text.length} chars</span>
          <button className="check-btn" onClick={handleCheck} disabled={loading || !text.trim()}>
            {loading ? <span className="spinner" /> : "Check Now →"}
          </button>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      {result && (
        <div className="result-card" style={{ borderColor: verdictColor[result.verdict] }}>
          <div className="verdict-badge" style={{ background: verdictColor[result.verdict] }}>
            {verdictIcon[result.verdict]} {result.verdict}
          </div>

          <div className="confidence-bar-wrap">
            <span className="conf-label">Confidence: {result.confidence}%</span>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${result.confidence}%`, background: verdictColor[result.verdict] }}
              />
            </div>
          </div>

          <div className="section">
            <h3>📋 Explanation</h3>
            <p>{result.explanation}</p>
          </div>

          <div className="section">
            <h3>🔍 Key Claims Analyzed</h3>
            <ul>
              {result.key_claims.map((claim, i) => (
                <li key={i}>{claim}</li>
              ))}
            </ul>
          </div>

          {result.corrections && (
            <div className="section corrections">
              <h3>✏️ Correction</h3>
              <p>{result.corrections}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

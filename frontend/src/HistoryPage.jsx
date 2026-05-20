import { useState, useEffect } from "react";
import "./HistoryPage.css";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/history?limit=20");
      const data = await res.json();
      setHistory(data.history);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    await fetch(`http://localhost:8000/history/${id}`, { method: "DELETE" });
    fetchHistory();
  };

  useEffect(() => { fetchHistory(); }, []);

  const verdictColor = {
    TRUE: "#00c896",
    FALSE: "#ff4d6d",
    "PARTIALLY TRUE": "#f4a261",
  };

  const verdictIcon = { TRUE: "✅", FALSE: "❌", "PARTIALLY TRUE": "⚠️" };

  return (
    <div className="history-page">
      <div className="history-header">
        <h2>Check History</h2>
        <button className="refresh-btn" onClick={fetchHistory}>↻ Refresh</button>
      </div>

      {loading && <div className="loading">Loading history...</div>}

      {!loading && history.length === 0 && (
        <div className="empty-state">
          <span>🔍</span>
          <p>No checks yet. Go check something!</p>
        </div>
      )}

      <div className="history-list">
        {history.map((item) => (
          <div className="history-card" key={item.id} style={{ borderLeft: `4px solid ${verdictColor[item.verdict]}` }}>
            <div className="history-card-header">
              <span className="history-verdict" style={{ color: verdictColor[item.verdict] }}>
                {verdictIcon[item.verdict]} {item.verdict}
              </span>
              <span className="history-confidence">{item.confidence}% confidence</span>
              <button className="delete-btn" onClick={() => deleteItem(item.id)}>🗑</button>
            </div>
            <p className="history-text">"{item.input_text.substring(0, 120)}{item.input_text.length > 120 ? "..." : ""}"</p>
            <p className="history-explanation">{item.explanation.substring(0, 150)}...</p>
            <span className="history-date">{new Date(item.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

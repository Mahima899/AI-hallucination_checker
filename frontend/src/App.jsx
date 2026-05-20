import { useState } from "react";
import CheckPage from "./CheckPage";
import HistoryPage from "./HistoryPage";
import "./App.css";

export default function App() {
  const [page, setPage] = useState("check");

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">TruthLens</span>
          <span className="logo-sub">AI Hallucination Checker</span>
        </div>
        <nav className="nav">
          <button className={`nav-btn ${page === "check" ? "active" : ""}`} onClick={() => setPage("check")}>Check</button>
          <button className={`nav-btn ${page === "history" ? "active" : ""}`} onClick={() => setPage("history")}>History</button>
        </nav>
      </header>
      <main className="main">
        {page === "check" ? <CheckPage /> : <HistoryPage />}
      </main>
    </div>
  );
}

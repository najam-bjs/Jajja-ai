import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithAuth, API_BASE } from "./services/api";
import { useAuth } from "./context/AuthContext";
import "./App.css";

type ChatMessage =
  | { role: "user"; content: string; error?: boolean }
  | { role: "assistant"; content: string; sources?: number[]; error?: boolean };

function App() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ text: string; ok: boolean } | null>(null);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);

  const navigate = useNavigate();
  const { signOut } = useAuth();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const uploadPDF = async (selectedFile: File) => {
    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetchWithAuth(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setDocuments((prev) =>
        prev.includes(selectedFile.name) ? prev : [...prev, selectedFile.name]
      );

      setActiveDocument(selectedFile.name);

      setUploadStatus({
        text: `${selectedFile.name} is ready to use.`,
        ok: true,
      });
    } catch (error) {
      console.error(error);

      setUploadStatus({
        text: "Couldn't upload that PDF. Try again.",
        ok: false,
      });
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    const trimmed = question.trim();

    if (!trimmed || asking) return;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: trimmed,
      },
    ]);

    setQuestion("");
    setAsking(true);

    try {
      const response = await fetchWithAuth(`${API_BASE}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: trimmed,
        }),
      });

      if (!response.ok) {
        throw new Error("Question failed");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong getting that answer. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const hasStarted = messages.length > 0 || asking;
  return (
    <div className="app-shell">
      {/* Background */}
      <div className="background-gradient"></div>
      <div className="background-grid"></div>

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <div className="logo-card">
            <div className="logo-icon">✦</div>
            <div>
              <h2>JajjaAI</h2>
              <p>Document Intelligence</p>
            </div>
          </div>

          <label className="upload-card">
            <div className="upload-icon">+</div>
            <div className="upload-content">
              <strong>
                {uploading ? "Uploading..." : "Upload PDF"}
              </strong>
              <span>
                Drag or choose a document
              </span>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              hidden
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];

                if (selectedFile) {
                  uploadPDF(selectedFile);
                }

                event.target.value = "";
              }}
            />
          </label>

          {uploadStatus && (
            <div
              className={`upload-status ${
                uploadStatus.ok ? "success" : "error"
              }`}
            >
              {uploadStatus.text}
            </div>
          )}
        </div>

        <div className="sidebar-search">
          <input
            type="text"
            placeholder="Search documents..."
          />
        </div>

        <div className="sidebar-section">
          <h4>Your Documents</h4>
          {documents.length === 0 ? (
            <div className="empty-documents">
              <div className="empty-icon">📄</div>
              <p>No PDFs uploaded</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div
                key={doc}
                className={`document-card ${
                  activeDocument === doc ? "active" : ""
                }`}
                onClick={() => setActiveDocument(doc)}
              >
                <div className="document-icon">
                  📄
                </div>
                <div className="document-details">
                  <strong>{doc}</strong>
                  <small>
                    {activeDocument === doc
                      ? "Currently Open"
                      : "Ready"}
                  </small>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-bottom">
          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="main-content">
        <header className="topbar">
          <div>
            <h1>
              {activeDocument
                ? activeDocument
                : "Welcome to JajjaAI"}
            </h1>
            <p>
              {activeDocument
                ? "Ask anything about your document."
                : "Upload a PDF and start chatting with AI."}
            </p>
          </div>

          <div className="topbar-actions">
            <div
              className={`status-badge ${
                asking ? "thinking" : ""
              }`}
            >
              <span className="pulse"></span>
              {uploading
                ? "Uploading"
                : asking
                ? "Thinking"
                : "Ready"}
            </div>
          </div>
        </header>

        <div className="content-layout">
          {/* ================= CHAT ================= */}
          <section className="chat-section">
            {!hasStarted && (
              <div className="welcome-screen">
                <div className="hero-badge">
                  ✨ AI Document Assistant
                </div>
                <h1>
                  Ask anything about your PDF
                </h1>
                <p>
                  Upload reports, books, notes or research papers.
                  JajjaAI will search through them and answer naturally.
                </p>

                <div className="suggestion-grid">
                  <button
                    onClick={() =>
                      setQuestion(
                        "Summarize this document."
                      )
                    }
                  >
                    <strong>📄 Summarize</strong>
                    <span>
                      Get a quick overview.
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setQuestion(
                        "Explain the important topics."
                      )
                    }
                  >
                    <strong>💡 Explain</strong>
                    <span>
                      Simplify difficult ideas.
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setQuestion(
                        "List all important dates."
                      )
                    }
                  >
                    <strong>📅 Important Dates</strong>
                    <span>
                      Find every date.
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setQuestion(
                        "Generate study notes."
                      )
                    }
                  >
                    <strong>🎓 Study Notes</strong>
                    <span>
                      Prepare for exams.
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ================= CHAT MESSAGES ================= */}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-row ${
                  message.role === "user" ? "user" : "assistant"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="assistant-avatar">
                    ✦
                  </div>
                )}

                <div
                  className={`message-card ${
                    message.role === "user"
                      ? "user-card"
                      : "assistant-card"
                  } ${message.error ? "error" : ""}`}
                >
                  <div className="message-header">
                    <strong>
                      {message.role === "user"
                        ? "You"
                        : "JajjaAI"}
                    </strong>
                  </div>

                  <div className="message-content">
                    {message.content}
                  </div>

                  {message.role === "assistant" &&
                    message.sources &&
                    message.sources.length > 0 && (
                      <div className="sources-container">
                        <small>Sources</small>
                        <div className="sources-list">
                          {message.sources.map((page, i) => (
                            <span
                              className="source-chip"
                              key={i}
                            >
                              Page {page}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            ))}

            {/* ================= THINKING ================= */}
            {asking && (
              <div className="message-row assistant">
                <div className="assistant-avatar">
                  ✦
                </div>
                <div className="message-card assistant-card thinking-card">
                  <div className="thinking-title">
                    JajjaAI is thinking...
                  </div>
                  <div className="thinking-loader">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </section>

          {/* ================= MASCOT ROBOT ================= */}
          <div className={`mascot ${asking ? "is-thinking" : ""}`}>
            <div className="mascot-bubble">
              {asking ? "Searching document..." : "Hello! Ready to assist."}
            </div>
            <div className="character">
              <div className="character-head">
                <div className="eye left-eye"></div>
                <div className="eye right-eye"></div>
              </div>
              <div className="character-body"></div>
            </div>
          </div>

          {/* ================= RIGHT PANEL ================= */}
          <aside className="info-panel">
            <div className="info-card">
              <h3>Current Document</h3>

              <div className="preview-placeholder">
                📄
              </div>

              <h4>
                {activeDocument || "No PDF Selected"}
              </h4>

              <div className="info-grid">
                <div className="info-item">
                  <span>Status</span>
                  <strong>
                    {activeDocument
                      ? "Loaded"
                      : "Waiting"}
                  </strong>
                </div>

                <div className="info-item">
                  <span>Questions</span>
                  <strong>{messages.length}</strong>
                </div>

                <div className="info-item">
                  <span>Pages</span>
                  <strong>--</strong>
                </div>
              </div>

              <div className="quick-actions">
                <button
                  onClick={() =>
                    setQuestion("Summarize this document")
                  }
                >
                  Summarize
                </button>

                <button
                  onClick={() =>
                    setQuestion("Explain everything simply")
                  }
                >
                  Explain
                </button>

                <button
                  onClick={() =>
                    setQuestion("List key points")
                  }
                >
                  Key Points
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* ================= FLOATING INPUT ================= */}
        <div className="floating-input">
          <button
            className="attach-button"
            onClick={() => fileInputRef.current?.click()}
          >
            +
          </button>

          <input
            type="text"
            placeholder="Ask anything about your document..."
            value={question}
            onChange={(e) =>
              setQuestion(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                askQuestion();
              }
            }}
          />

          <button
            className="send-button"
            disabled={asking || !question.trim()}
            onClick={askQuestion}
          >
            →
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; sources?: number[]; error?: boolean };

function ThinkingCharacter({ thinking }: { thinking: boolean }) {
  return (
    <div className={`mascot ${thinking ? "is-thinking" : ""}`}>
      <div className="mascot-bubble">{thinking ? "Hmm..." : "OYE!"}</div>

      <div className="character">
        {/* HEAD */}
        <div className="character-head">
          <div className="hair"></div>
          <div className="face">
            <div className="eye left-eye"></div>
            <div className="eye right-eye"></div>
            <div className="eyebrow left-eyebrow"></div>
            <div className="eyebrow right-eyebrow"></div>
            <div className="nose"></div>
            <div className="mustache"></div>
            <div className="mouth"></div>
          </div>
        </div>

        {/* NECK */}
        <div className="neck"></div>

        {/* BODY */}
        <div className="character-body">
          <div className="jersey-number">Jajja</div>
        </div>

        {/* SIGNATURE PROP */}
        <div className="cricket-bat"></div>

        {/* ARMS */}
        <div className="character-arm left-arm">
          <div className="hand"></div>
        </div>
        <div className="character-arm right-arm">
          <div className="hand"></div>
        </div>

        {/* LEGS */}
        <div className="character-leg left-leg">
          <div className="shoe"></div>
        </div>
        <div className="character-leg right-leg">
          <div className="shoe"></div>
        </div>
      </div>

      <div className="character-shadow"></div>
    </div>
  );
}

function App() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [activeDocument, setActiveDocument] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ text: string; ok: boolean } | null>(null);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [asking, setAsking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, asking]);

  const uploadPDF = async (selectedFile: File) => {
    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
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
      setUploadStatus({ text: `${selectedFile.name} is ready to use.`, ok: true });
    } catch (error) {
      console.error(error);
      setUploadStatus({ text: "Couldn't upload that PDF. Try again.", ok: false });
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    const trimmed = question.trim();
    if (!trimmed || asking) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setQuestion("");
    setAsking(true);

    try {
      const response = await fetch(`${API_BASE}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Question failed");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer, sources: data.sources || [] },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong getting that answer. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setAsking(false);
    }
  };

  const hasStarted = messages.length > 0 || asking;

  return (
    <div className="app">
      <div className="bg-orbs" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div className="grain" aria-hidden="true"></div>

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        <div className="logo">
          Jajja<span>Ai</span>
        </div>

        <label className="upload-btn">
          {uploading ? "Uploading..." : "+ Upload PDF"}
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
              // allow re-selecting the same file later
              event.target.value = "";
            }}
          />
        </label>

        {uploadStatus && (
          <p className={`upload-message ${uploadStatus.ok ? "success" : "error"}`}>
            {uploadStatus.text}
          </p>
        )}

        <div className="documents">
          <p className="section-title">DOCUMENTS</p>

          {documents.length === 0 ? (
            <p className="no-documents">No documents yet. Upload a PDF to get started.</p>
          ) : (
            documents.map((name) => (
              <div
                key={name}
                className={`document ${name === activeDocument ? "active" : ""} ${
                  asking && name === activeDocument ? "scanning" : ""
                }`}
                onClick={() => setActiveDocument(name)}
                role="button"
                tabIndex={0}
              >
                📄 {name}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <main className="main">
        {/* HEADER */}
        <header className="header">
          <div>
            <h1>Document Assistant</h1>
            <p>Ask questions about your PDF</p>
          </div>

          <div className="header-right">
            <span className={`status-pill ${uploading || asking ? "active" : ""}`}>
              <i></i>
              {uploading ? "Uploading" : asking ? "Thinking" : "Ready"}
            </span>

            <button className="settings-btn" aria-label="Settings">
              ⚙
            </button>
          </div>
        </header>

        {/* PERMANENT MASCOT */}
        <ThinkingCharacter thinking={asking} />

        {/* ================= CHAT ================= */}
        <section className="chat">
          {/* WELCOME */}
          {!hasStarted && (
            <div className="welcome">
              <div className="welcome-icon">✦</div>
              <h2>What can I help you find?</h2>
              <p>Upload a document and ask anything about its content.</p>

              <div className="suggestions">
                <button onClick={() => setQuestion("Summarize this document")}>
                  <span>✦</span>
                  <div>
                    <strong>Summarize this document</strong>
                    <small>Get the main points quickly</small>
                  </div>
                </button>

                <button onClick={() => setQuestion("What are the key points?")}>
                  <span>◈</span>
                  <div>
                    <strong>Find the key points</strong>
                    <small>Discover the most important information</small>
                  </div>
                </button>

                <button onClick={() => setQuestion("What are the important dates?")}>
                  <span>◷</span>
                  <div>
                    <strong>Find important dates</strong>
                    <small>Locate dates mentioned in the document</small>
                  </div>
                </button>

                <button onClick={() => setQuestion("Explain this document simply")}>
                  <span>✧</span>
                  <div>
                    <strong>Explain it simply</strong>
                    <small>Understand difficult sections easier</small>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* MESSAGE HISTORY */}
          {messages.map((message, index) =>
            message.role === "user" ? (
              <div className="user-message" key={index}>
                <strong>You</strong>
                <p>{message.content}</p>
              </div>
            ) : (
              <div className={`ai-message ${message.error ? "error" : ""}`} key={index}>
                <div className="ai-message-header">
                  <div className="ai-avatar">✦</div>
                  <strong>JajjaAi</strong>
                </div>

                <p>{message.content}</p>

                {message.sources && message.sources.length > 0 && (
                  <div className="sources">
                    <strong>Sources</strong>
                    <div className="source-list">
                      {message.sources.map((page, sourceIndex) => (
                        <span className="source" key={sourceIndex}>
                          Page {page}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          )}

          {/* THINKING */}
          {asking && (
            <div className="thinking-status">
              <span>JajjaAi is thinking... </span>
              <div className="thinking-dots">
                <i></i>
                <i></i>
                <i></i>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </section>

        {/* ================= INPUT ================= */}
        <div className="input-area">
          <button
            className="attach-btn"
            title="Upload PDF"
            aria-label="Upload PDF"
            onClick={() => fileInputRef.current?.click()}
          >
            +
          </button>

          <input
            type="text"
            placeholder="Ask anything about your document..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                askQuestion();
              }
            }}
          />

          <button
            className="send-btn"
            aria-label="Send question"
            onClick={askQuestion}
            disabled={asking || !question.trim()}
          >
            ↑
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
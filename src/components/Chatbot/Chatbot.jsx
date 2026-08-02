import { useState, useRef, useEffect } from "react";
import { Copy, Check, FileText, ShieldAlert, X, Download, ShieldCheck } from "lucide-react";
import "./Chatbot.css";

let fallbackUrl = "https://sentinelcore-9hxu.onrender.com";
const API_URL = (import.meta.env.VITE_API_URL || fallbackUrl).replace(/\/$/, "");

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am SentinelCore Security Assistant. How can I help you?",
      severity: "Low"
    }
  ]);

  const [input, setInput] = useState("");
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: currentInput })
      });

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: data.reply,
          severity: data.severity || "Low",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Backend connection failed. Please check your network or security configuration.",
          severity: "High",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleCopyText = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SentinelCore_Incident_Report_${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openReportModal = (text) => {
    setReportText(text);
    setReportOpen(true);
  };

  // Convert markdown into HTML safely
  const formatContent = (content) => {
    if (!content) return "";

    // Escape basic HTML
    let html = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Convert Headings
    html = html
      .replace(/^### (.*$)/gim, '<h3 style="color:#93c5fd; font-size:14px; margin: 10px 0 6px 0; font-weight:600;">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="color:#60a5fa; font-size:16px; margin: 12px 0 8px 0; font-weight:600;">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="color:#3b82f6; font-size:18px; margin: 14px 0 10px 0; font-weight:700;">$1</h1>');

    // Bold & Italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Inline Code
    html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Lists
    html = html
      .replace(/^\* (.*$)/gim, '<li style="margin-left: 15px; list-style-type: disc; margin-bottom: 4px;">$1</li>')
      .replace(/^- (.*$)/gim, '<li style="margin-left: 15px; list-style-type: disc; margin-bottom: 4px;">$1</li>')
      .replace(/^(\d+)\. (.*$)/gim, '<li style="margin-left: 15px; list-style-type: decimal; margin-bottom: 4px;">$2</li>');

    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="msg-quote">$1</blockquote>');

    // Code blocks
    html = html.replace(/```([a-z0-9]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<div class="code-block-wrapper">
        <div class="code-header">
          <span>${lang || "code"}</span>
        </div>
        <pre class="code-pre"><code>${code.trim()}</code></pre>
      </div>`;
    });

    // Tables
    const tableRegex = /\|(.+)\|[\r\n]+\|[-:| ]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
    html = html.replace(tableRegex, (match, header, rows) => {
      const headers = header.split('|').filter(h => h.trim().length > 0).map(h => `<th>${h.trim()}</th>`).join('');
      const rowLines = rows.trim().split('\n');
      const formattedRows = rowLines.map(r => {
        const cells = r.split('|').filter(c => c.trim().length > 0).map(c => `<td>${c.trim()}</td>`).join('');
        return `<tr>${cells}</tr>`;
      }).join('');

      return `<div class="table-responsive"><table class="msg-table"><thead><tr>${headers}</tr></thead><tbody>${formattedRows}</tbody></table></div>`;
    });

    return { __html: html };
  };

  return (
    <>
      <button
        className="chat-button"
        onClick={() => setOpen(!open)}
        title="SentinelCore Security Assistant"
      >
        🤖
      </button>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>SentinelCore AI Security Assistant</span>
            <button className="close-btn" onClick={() => setOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className="chat-body" ref={chatBodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={msg.sender}>
                {msg.sender === "bot" && msg.severity && (
                  <div className={`severity-badge ${msg.severity.toLowerCase()}`}>
                    <ShieldAlert size={11} />
                    <span>SEVERITY: {msg.severity.toUpperCase()}</span>
                  </div>
                )}

                <div
                  className="formatted-message-text"
                  dangerouslySetInnerHTML={formatContent(msg.text)}
                />

                {msg.sender === "bot" && (
                  <div className="message-action-toolbar">
                    <button
                      className="toolbar-btn"
                      onClick={() => handleCopyText(msg.text, index)}
                      title="Copy markdown text"
                    >
                      {copiedIndex === index ? <Check size={11} color="#22C55E" /> : <Copy size={11} />}
                      <span>{copiedIndex === index ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      className="toolbar-btn primary"
                      onClick={() => openReportModal(msg.text)}
                      title="Export as Executive Incident Report"
                    >
                      <FileText size={11} />
                      <span>Executive Report</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask security questions (e.g. 'Investigate alert')..."
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {/* Incident & Risk Report Modal */}
      {reportOpen && (
        <div className="modal-backdrop" onClick={() => setReportOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-left">
                <ShieldCheck size={20} style={{ color: "#22C55E" }} />
                <div>
                  <h3 className="modal-title">Executive Incident & Risk Report</h3>
                  <span className="modal-subtitle">SentinelCore Enterprise SOC Telemetry Report</span>
                </div>
              </div>
              <button className="modal-close-btn" onClick={() => setReportOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <pre className="report-pre">{reportText}</pre>
            </div>

            <div className="modal-footer">
              <button className="modal-btn secondary" onClick={handleCopyReport}>
                {copiedReport ? <Check size={14} color="#22C55E" /> : <Copy size={14} />}
                <span>{copiedReport ? 'Copied to Clipboard' : 'Copy Markdown'}</span>
              </button>

              <button className="modal-btn primary" onClick={handleDownloadReport}>
                <Download size={14} />
                <span>Download .MD Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
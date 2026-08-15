import { useState, useEffect, useRef } from "react";
import "./Chatbot.css";

let fallbackUrl = "http://localhost:5005";
const CHATBOT_API_URL = (import.meta.env.VITE_CHATBOT_API_URL || import.meta.env.VITE_API_URL || fallbackUrl).replace(/\/$/, "");

const SUGGESTIONS = [
  "General health summary",
  "Show critical and high alerts",
  "Are there any vulnerabilities?",

];

function Chatbot({
  incidents = [],
  alerts = [],
  threats = [],
  assets = [],
  logs = []
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am **Sentinel AI**, your dedicated cybersecurity analyst. Ask me anything about your active devices, system health, threat updates, or security alerts."
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const bodyRef = useRef(null);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  /***const handleSend = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text }]);
    if (!textToSend) setInputVal("");

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "⚠️ I had trouble connecting to the security server. Please ensure the backend is running properly and try again."
          }
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ System connection error. I'm unable to reach the Sentinelcore backend."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };***/


  const handleSend = async (textToSend) => {
    const text = textToSend || inputVal;
    if (!text.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text }]);

    if (!textToSend) {
      setInputVal("");
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Current SentinelCore application data
      const liveData = {
        incidents: incidents,
        alerts: alerts,
        threats: threats,
        assets: assets,
        logs: logs
      };

      console.log("Sending live data to chatbot:", liveData);

      const res = await fetch(`${CHATBOT_API_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          liveData: liveData
        })
      });

      if (res.ok) {
        const data = await res.json();

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.reply
          }
        ]);
      } else {
        const errorText = await res.text();

        console.error("Chatbot API error:", errorText);

        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: "⚠️ I had trouble connecting to the security server. Please ensure the backend is running properly and try again."
          }
        ]);
      }

    } catch (err) {
      console.error("Chat error:", err);

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ System connection error. I'm unable to reach the SentinelCore backend."
        }
      ]);

    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleSend();
    }
  };

  // Simple Markdown parser for rendering bold words, lists, blockquotes, and headers inside chat bubbles
  const renderMessageContent = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content = line.trim();
      if (!content) return <div key={idx} style={{ height: "6px" }} />;

      if (content.startsWith("### ")) {
        return <h3 key={idx}>{parseInlineMarkdown(content.substring(4))}</h3>;
      }

      if (content.startsWith("> ")) {
        return <blockquote key={idx}>{parseInlineMarkdown(content.substring(2))}</blockquote>;
      }

      if (content.startsWith("- ") || content.startsWith("* ")) {
        return <li key={idx}>{parseInlineMarkdown(content.substring(2))}</li>;
      }

      return <p key={idx}>{parseInlineMarkdown(content)}</p>;
    });
  };

  const parseInlineMarkdown = (text) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index}>{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle Chatbot">
        {!isOpen && <div className="chatbot-toggle-pulse" />}
        {isOpen ? (
          // Close Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          // Message Icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-header-title">
                🛡️ Sentinel AI Analyst
              </div>
              <div className="chatbot-header-subtitle">
                <span className="chatbot-status-dot"></span> Online & Securing
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)} aria-label="Close Chat">
              &times;
            </button>
          </div>

          <div className="chatbot-body" ref={bodyRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`chatbot-message ${msg.sender}`}>
                {renderMessageContent(msg.text)}
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message bot">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Suggestions */}
          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                className="chatbot-suggestion-tag"
                onClick={() => handleSend(sug)}
                disabled={isLoading}
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="chatbot-footer">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask a security question..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={isLoading || !inputVal.trim()}
              aria-label="Send Message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;

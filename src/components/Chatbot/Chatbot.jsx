import { useState } from "react";
import "./Chatbot.css";

let fallbackUrl = "https://sentinelcore-9hxu.onrender.com";
const API_URL = (import.meta.env.VITE_API_URL || fallbackUrl).replace(/\/$/, "");

function Chatbot() {

  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am SentinelCore Security Assistant. How can I help you?"
    }
  ]);

  const [input, setInput] = useState("");


  const sendMessage = async () => {

    if (!input.trim()) return;


    const userMessage = {
      sender: "user",
      text: input
    };


    setMessages(prev => [...prev, userMessage]);


    try {

      const response = await fetch(
        `${API_URL}/api/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: input
          })
        }
      );


      const data = await response.json();


      setMessages(prev => [
        ...prev,
        {
          sender: "bot",
          text: data.reply
        }
      ]);


    } catch(error) {

      setMessages(prev => [
        ...prev,
        {
          sender:"bot",
          text:"⚠️ Backend connection failed."
        }
      ]);

    }


    setInput("");
  };


  return (
    <>
      <button
        className="chat-button"
        onClick={() => setOpen(!open)}
      >
        🤖
      </button>


      {open && (
        <div className="chat-window">

          <div className="chat-header">
            SentinelCore AI Assistant
          </div>


          <div className="chat-body">

            {messages.map((msg,index)=>(
              <div
                key={index}
                className={msg.sender}
              >
                {msg.text}
              </div>
            ))}

          </div>


          <div className="chat-input">

            <input
              value={input}
              onChange={(e)=>setInput(e.target.value)}
              placeholder="Ask security questions..."
              onKeyDown={(e)=>{
                if(e.key==="Enter")
                  sendMessage();
              }}
            />


            <button onClick={sendMessage}>
              Send
            </button>

          </div>

        </div>
      )}

    </>
  );
}

export default Chatbot;
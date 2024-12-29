import React, { useState, useEffect } from "react";
import socket from "../socket";

function OpenChat({ username }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const sendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("chatMessage2", { username, message });
    setMessage("");
  };

  useEffect(() => {
    socket.on("chatMessage2", (message) => {
      setChatHistory(prevHistory => [...prevHistory, message]);
    });

    return () => {
      socket.off("chatMessage2");
    };
  }, []);

  return (
    <div>
      <div>
        <h2>Chat</h2>
        <div className="chat-log">
          {chatHistory.map((msg, index) => (
            <p key={index}><strong>{msg.username}:</strong> {msg.message}</p>
          ))}
        </div>
      </div>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default OpenChat;
import React, { useState, useEffect } from "react";
import socket from "../socket";

function Chat({ room }) {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [boldUser, setBoldUser] = useState("");
  
  

  const sendMessage = () => {
    if (message.trim() === "") return;
  
    console.log(`Sending message: ${message}`); // Debugging statement
  
    // Emit the chat message to the server, including the room identifier
    socket.emit("chatMessage", { room, message });
  
    // Add the message to the chat history

    setMessage("");
  };
  useEffect(() => {
    socket.on("chatMessage", ({ sender, message }) => {
      console.log(`Received message from ${sender}: ${message}`);
      // Verify that messages are being added to chatHistory
      setChatHistory([...chatHistory, { text: message, sender }]);
    });
  
    return () => {
      // console.log("Chat component unmounted");
      // console.log(chatHistory);
      // console.log(boldSetter())
      socket.off("chatMessage");
    };
  }, [chatHistory]);

  function boldSetter(){
    let users = []
    if (Object.keys(chatHistory).length >= 1){
      
      for (let i = 0; i < Object.keys(chatHistory).length; i++){
        if (!users.includes(chatHistory[i].sender)){
          users.push(chatHistory[i].sender)
        }
      }
    }
    if (users.length >= 1){
      setBoldUser(users[0])
    }
    
  }

  function returnBold(user, text){
    if (user == boldUser){
      return (
        <li>
      <b className="colored-text">{user}:</b> {text}
    </li>
      )
    }
    else {
      return (
        <li>
      <b className="non-colored-text">{user}:</b> {text}
    </li>
      )
    }
  }

  return (
    <div>
      <div>
        <h2>Chat</h2>
      <div className="chat-log">
  {chatHistory.reverse().map((entry) => (
    returnBold(entry.sender, entry.text)
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

export default Chat;
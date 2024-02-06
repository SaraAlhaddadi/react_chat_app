import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

const server = "localhost:3000";
const webSocket = new WebSocket(`ws://${server}/cable`);
const messagesContainer = document.getElementById("messages");
function App() {
  const [messages, setMessages] = useState([]);
  const [guid, setGuid] = useState("");

  webSocket.onopen = () => {
    console.log(`connecting to webSocket server ${server}`);
    setGuid(Math.random().toString(36).substring(2, 15));

    webSocket.send(
      JSON.stringify({
        id: guid,
        channel: "MessagesChannel",
      })
    );
  };

  webSocket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    console.log(`get message webSocket server ${server} which ${data.type}`);
    console.log(data);

    if (data.type === 'ping') return;
    if (data.type === 'welcome') return;
    if (data.type === 'confirm_submit') return;

    const message = data.message;
    setMessagesAndScrollDown([...messages, message]);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const response = await fetch(`http://${server}/messages`);
    const data = await response.json();
    setMessagesAndScrollDown(data);
  };

  const setMessagesAndScrollDown = (data) => {
    setMessages(data);
    if (!messagesContainer) return;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = e.target.message.value;
    e.target.message.value = "";

    await fetch(`http://${server}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ body }),
    });
  };

  return (
    <div className="App">
      <div className="messageHeader">
        <h2>Messages</h2>
        <p>Guid: {guid}</p>
      </div>

      <div className="messages" id="messages">
        {messages.map((message) => (
          <div className="message" key={message.id}>
            <p>{message.body}</p>
          </div>
        ))}
      </div>

      <div className="messageForm">
        <form onSubmit={handleSubmit}>
          <input className="messageInput" type="text" name="message" />
          <button className="messageButton" type="submit">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;

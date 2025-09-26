import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import UserInput from './components/UserInput';
import axios from "axios";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message first
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/chat", {
        question: input,
        sessionId,   // send session if exists
      });

      const { answer, sessionId: newSessionId } = response.data;

      // Save sessionId if it's new
      if (!sessionId) setSessionId(newSessionId);

      // Add AI response
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (error) {
      console.error("Error calling backend:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error fetching AI response" },
      ]);
    }

    setInput("");      // clear input field
    setIsLoading(false);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <Chat messages={messages} isLoading={isLoading} />
      {/* Pass state + handler properly */}
      <UserInput 
        onSendMessage={handleSend} 
        input={input} 
        setInput={setInput} 
        isLoading={isLoading} 
      />
    </div>
  );
};

export default App;

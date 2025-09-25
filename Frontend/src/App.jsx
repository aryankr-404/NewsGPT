import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Chat from './components/Chat';
import UserInput from './components/UserInput';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (messageContent) => {
    const userMessage = { content: messageContent, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    
    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage = { content: "This is AI response", isUser: false };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <Chat messages={messages} />
      <UserInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;
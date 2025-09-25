import React, { useRef, useEffect } from 'react';
import Message from './Message';

const Chat = ({ messages }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div 
      className="flex-1 overflow-y-auto bg-gray-900"
      style={{
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none'  /* IE and Edge */
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .flex-1::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">What are you working on?</h1>
            <p className="text-gray-400 text-lg">Ask anything...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <Message 
                key={index} 
                message={message.content} 
                isUser={message.isUser} 
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Chat;
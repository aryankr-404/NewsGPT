import React, { useRef, useEffect } from 'react';
import { User, Bot } from 'lucide-react';
import Message from './Message';

const TypingIndicator = () => (
  <div className="bg-gray-800 px-3 py-2 rounded-2xl">
    <div className="flex items-center space-x-1">
      <span className="typing-dot" />
      <span className="typing-dot delay-1" />
      <span className="typing-dot delay-2" />
    </div>
    <style>{`
      .typing-dot {
        width: 6px;
        height: 6px;
        background: #9ca3af;
        border-radius: 999px;
        display: inline-block;
        opacity: 0.7;
        transform: translateY(0);
        animation: typing 1s infinite;
      }
      .typing-dot.delay-1 { animation-delay: 0.12s; }
      .typing-dot.delay-2 { animation-delay: 0.24s; }
      @keyframes typing {
        0% { transform: translateY(0); opacity: 0.4; }
        50% { transform: translateY(-6px); opacity: 1; }
        100% { transform: translateY(0); opacity: 0.4; }
      }
    `}</style>
  </div>
);

const Chat = ({ messages = [], isLoading = false }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-900" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style dangerouslySetInnerHTML={{ __html: `.flex-1::-webkit-scrollbar { display: none; }` }} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">What are you working on?</h1>
            <p className="text-gray-400 text-lg">Ask anything...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex items-end ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="mr-3">
                      <Bot className="w-6 h-6 text-green-400" />
                    </div>
                  )}

                  {/* Message bubble */}
                  <Message message={msg.content} isUser={isUser} />

                  {isUser && (
                    <div className="ml-3">
                      <User className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex items-end justify-start">
                <div className="mr-3">
                  <Bot className="w-6 h-6 text-green-400" />
                </div>
                <div className="max-w-[60%]">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default Chat;

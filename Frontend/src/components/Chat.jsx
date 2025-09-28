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
    <div
      className="flex-1 overflow-y-auto bg-gray-900"
      style={{
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none' /* IE and Edge */
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
          // ——— Updated empty state UI (in-line with background, not a detached box) ———
          <div className="flex flex-col items-start justify-center h-full text-left py-20">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-4">
              NewsGPT
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mb-6">
              Ask for headlines, summaries, timelines, or article links — NewsGPT fetches the latest sourced articles and replies with clear, emoji-friendly answers.
            </p>

            <div className="flex flex-wrap gap-3">
              {/* Suggested queries as subtle chips */}
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full text-sm transition">
                📰 Give me top headlines
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full text-sm transition">
                🔍 Link for the BBC article
              </button>
              <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-full text-sm transition">
                ✍️ Summarize latest tech news
              </button>
            </div>

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

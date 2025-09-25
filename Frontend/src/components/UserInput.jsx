import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, Mic, Paperclip } from 'lucide-react';

const UserInput = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  return (
    <div className="bg-gray-900 border-t border-gray-700">
      <div className="max-w-4xl mx-auto p-4">
        <div className="relative">
          <div className="relative flex items-end bg-gray-800 rounded-2xl border border-gray-600 focus-within:border-gray-500">
            <button
              type="button"
              className="absolute left-3 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="flex-1 bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none py-4 px-12 min-h-[56px] max-h-[150px]"
              rows={1}
              disabled={isLoading}
            />
            
            <div className="flex items-center space-x-2 px-3 py-2">
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className={`p-2 rounded-lg transition-colors ${
                  input.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          ChatGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};

export default UserInput;
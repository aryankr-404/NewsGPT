import React from 'react';
import { MessageSquare } from 'lucide-react';

const Message = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-3xl px-6 py-4 rounded-lg ${
        isUser 
          ? 'bg-blue-600 text-white ml-auto' 
          : 'bg-gray-800 text-gray-100'
      }`}>
        <div className="flex items-start space-x-3">
          {!isUser && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
import React from "react";
import { MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Message = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-3xl px-4 py-3 rounded-lg overflow-hidden ${
          isUser
            ? "bg-blue-600 text-white ml-auto"
            : "bg-gray-800 text-gray-100"
        }`}
      >
        <div className="flex items-start space-x-3">
          {!isUser && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="flex-1 text-sm leading-relaxed">
            {/* ✅ Render Markdown here */}
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              
              components={{
                a: (props) => (
                  <a
                    {...props}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 underline hover:text-blue-300"
                  />
                ),
                strong: (props) => <strong className="font-semibold" {...props} />,
                code: (props) => (
                  <code className="bg-gray-700 rounded px-1 py-0.5 text-sm" {...props} />
                ),
                ul: (props) => <ul className="list-disc pl-6" {...props} />,
                ol: (props) => <ol className="list-decimal pl-6" {...props} />,
                blockquote: (props) => (
                  <blockquote
                    className="border-l-4 border-gray-500 pl-3 italic text-gray-300"
                    {...props}
                  />
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;

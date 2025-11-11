// src/components/UserInput.jsx
import React, { useRef, useEffect } from "react";
import { Send } from "lucide-react";

const UserInput = ({ onSendMessage, input, setInput, isLoading }) => {
  const textareaRef = useRef(null);
  const formRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`; // cap height
  }, [input]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!input || !input.trim()) return;
    await onSendMessage();
  };

  const handleKeyDown = (e) => {
    // Enter to send, Shift+Enter for newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full py-5 border-t border-gray-800 bg-gradient-to-t from-transparent to-black"
      aria-label="Send message form"
    >
      <div className="w-full max-w-5xl mx-auto flex items-center gap-3">
        {/* expanding textarea */}
        <div className="flex-1">
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message — e.g. “Give me top headlines” or press Enter to send"
            className="w-full resize-none min-h-[40px] max-h-60 rounded-xl bg-gray-800 text-gray-100 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/30"
            rows={1}
            aria-label="Message input"
          />
        </div>

        {/* Send button */}
        <div className="flex items-center">
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-disabled={isLoading || !input.trim()}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition
              ${
                isLoading || !input.trim()
                  ? "bg-indigo-600/40 cursor-not-allowed text-gray-200"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
          >
            {isLoading ? (
              <svg
                className="w-4 h-4 animate-spin text-white align-middle"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? "Sending..." : "Send"}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserInput;

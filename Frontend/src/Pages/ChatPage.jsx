import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Chat from "../components/Chat";
import UserInput from "../components/UserInput";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ChatPage = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // for sending messages
  const [isFetchingHistory, setIsFetchingHistory] = useState(true);
  const [input, setInput] = useState("");

  // Load chat history when userId is available
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;

      setIsFetchingHistory(true); // start loader
      try {
        const response = await axios.get(
          `${BACKEND_URL}/api/chat/history/${user.id}`
        );

        if (response.data?.history) {
          setMessages(response.data.history);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsFetchingHistory(false); // stop loader
      }
    };

    fetchHistory();
  }, [user]);

  if (isFetchingHistory) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white text-lg">
        Loading chat history...
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || !user?.id) return;

    // Add user's message locally
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setIsLoading(true);
    setInput("");

    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat`, {
        question: input,
        userId: user.id,
      });

      const { answer } = response.data;
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (error) {
      console.error("Error calling backend:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Error fetching AI response" },
      ]);
    }

    setIsLoading(false);
  };

  // Note: update-news is now triggered from the Navbar refresh button.

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <Chat messages={messages} isLoading={isLoading} />
      <div className="flex justify-center w-full">
        <UserInput
          onSendMessage={handleSend}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatPage;

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Chat from "../components/Chat";
import UserInput from "../components/UserInput";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";  // ✅ to get Clerk userId

const ChatPage = () => {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // for sending messages
  const [isFetchingHistory, setIsFetchingHistory] = useState(true); // ✅ for history
  const [input, setInput] = useState("");

  // Load chat history when userId is available
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) return;

      setIsFetchingHistory(true); // start loader
      try {
        const response = await axios.get(
          `http://localhost:8080/api/chat/history/${user.id}`
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
      const response = await axios.post("http://localhost:8080/api/chat", {
        question: input,
        userId: user.id, // ✅ send Clerk userId instead of sessionId
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

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      <Navbar />
      <Chat messages={messages} isLoading={isLoading} />
      <UserInput
        onSendMessage={handleSend}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatPage;

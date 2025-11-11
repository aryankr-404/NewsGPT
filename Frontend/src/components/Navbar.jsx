import React, { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import axios from "axios";
import { MdRefresh } from "react-icons/md";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Navbar = () => {
  const [isUpdatingNews, setIsUpdatingNews] = useState(false);

  const handleRefreshClick = async () => {
    if (isUpdatingNews) return;
    setIsUpdatingNews(true);
    try {
      await axios.post(`${BACKEND_URL}/update-news`);
      console.log("News feed updated successfully");
    } catch (err) {
      console.error("Error updating news feed:", err);
    } finally {
      setIsUpdatingNews(false);
    }
  };

  return (
    <nav
      className="
        fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 py-2 lg:bg-transparent
      md:bg-black md:backdrop-blur-none 
      transition-colors duration-200
      "
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold text-lg flex items-center gap-2">
              NewsGPT
              <button
                onClick={handleRefreshClick}
                aria-label="Refresh news feed"
                className="p-1 rounded hover:bg-white/10"
                title="Refresh news feed"
              >
                {isUpdatingNews ? (
                  <MdRefresh className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <MdRefresh className="h-4 w-4 text-white" />
                )}
              </button>
            </span>
          </div>
        </div>

        {/* Right side: Clerk UserButton */}
        <div>
          <UserButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

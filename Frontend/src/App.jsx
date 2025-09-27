import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import Login from "./Pages/Login";
import Main from "./Pages/ChatPage"; // your current chat app moved here

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Chat route */}
        <Route
          path="/chat"
          element={
            <>
              <SignedIn>
                <Main />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn redirectUrl="/chat" />
              </SignedOut>
            </>
          }
        />

        {/* Default fallback -> redirect to /login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;

import React, { useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      navigate("/chat");
    }
  }, [isSignedIn, navigate]);

  // Callback after successful sign-in
  const handleSignIn = () => {
    navigate("/chat");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome</h1>

        {/* If user is not signed in -> show SignIn button */}
        <SignedOut>
          <SignInButton mode="modal" onSignIn={handleSignIn}>
            <button className="px-6 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        {/* If user is signed in -> show User button */}
        <SignedIn>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg">You are signed in ✅</p>
            <UserButton signOutUrl="/login" />
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Login;

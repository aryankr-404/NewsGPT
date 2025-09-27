import React from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-6">Welcome</h1>

        {/* If user is not signed in -> show SignIn button */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-6 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 transition">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        {/* If user is signed in -> show User button */}
        <SignedIn>
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg">You are signed in ✅</p>
            <UserButton afterSignOutUrl="/login" />
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Login;

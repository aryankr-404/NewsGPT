import React, { useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { Newspaper, Sparkles, Clock, Globe } from "lucide-react";

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
    <>
      {/* Main container — add top padding to avoid overlap with Navbar */}
      <div className="min-h-[calc(100vh-64px)] pt-10 pb-12 bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left: Brand + preview */}
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-4 py-2 rounded-full shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-sm font-medium">AI-powered news, summarized & sourced</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
                NewsGPT <span className="text-indigo-400">—</span>
                <span className="block text-xl font-medium text-gray-300 mt-2">Your friendly news RAG assistant (fast, sourced, and emoji-friendly)</span>
              </h1>

              <p className="text-gray-400 max-w-xl">
                Ask for headlines, article summaries, timelines, or links — NewsGPT will fetch relevant articles and respond clearly with sources. Safe, factual, and helpful.
              </p>

              {/* Feature list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <Newspaper className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="font-semibold">Curated Headlines</div>
                    <div className="text-gray-400 text-sm">Daily top stories & quick overviews.</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <Globe className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="font-semibold">Sourced & Verified</div>
                    <div className="text-gray-400 text-sm">All answers cite the original articles.</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <Clock className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="font-semibold">Quick Context</div>
                    <div className="text-gray-400 text-sm">Uses the latest stored articles for context.</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-gray-800 rounded-lg">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <div className="font-semibold">Engaging Tone</div>
                    <div className="text-gray-400 text-sm">Friendly replies with emojis for clarity.</div>
                  </div>
                </div>
              </div>

              {/* Small preview card */}
              <div className="mt-6">
                <div className="bg-gray-800/60 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400 uppercase">Sample headline</div>
                      <div className="font-semibold text-white">Sonic the Hedgehog boss on how the series keeps up to speed 🚀</div>
                      <div className="text-xs text-gray-400 mt-2">Source: BBC • Sep 26, 2025</div>
                    </div>
                    <div className="ml-4 text-sm">
                      <a
                        className="inline-flex items-center px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-sm"
                        href="#"
                        onClick={(e) => e.preventDefault()}
                      >
                        Read
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Sign-in card */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md bg-gradient-to-tr from-gray-800/60 to-gray-800/40 border border-gray-700 rounded-2xl p-8 shadow-xl">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold">Sign in to NewsGPT</h2>
                  <p className="text-gray-400 mt-2">Access your saved chats and personalized news feed.</p>
                </div>

                {/* SignedOut: show sign in button */}
                <SignedOut>
                  <div className="space-y-4">
                    <SignInButton mode="modal" onSignIn={handleSignIn}>
                      <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition">
                        <Sparkles className="w-5 h-5 text-white" />
                        <span>Sign in with Clerk</span>
                      </button>
                    </SignInButton>

                    <div className="text-center text-sm text-gray-400">
                      <div>Or continue as a guest for quick previews</div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      By signing in you agree to our <a className="text-indigo-400 hover:underline" href="/privacy">Privacy Policy</a>.
                    </div>
                  </div>
                </SignedOut>

                {/* SignedIn: show confirmation + profile */}
                <SignedIn>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-green-400 font-medium">Signed in successfully ✅</div>
                    <div className="w-full flex items-center justify-center">
                      <UserButton signOutUrl="/login" />
                    </div>
                    <button
                      onClick={() => navigate("/chat")}
                      className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white font-semibold"
                    >
                      Go to Chat
                    </button>
                  </div>
                </SignedIn>
              </div>
            </div>

          </div>

          {/* small footer */}
          <div className="mt-10 text-center text-sm text-gray-500">
            <span>Built with ❤️ • NewsGPT</span> <span className="mx-2">•</span>
            <a className="text-indigo-400 hover:underline" href="mailto:hello@newsgpt.example">Contact</a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;

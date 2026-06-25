"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function AuthOverlay() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorMsg = urlParams.get("error");
    const errorCode = urlParams.get("error_code");
    if (errorMsg) {
      setError(`${errorMsg}${errorCode ? ` (${errorCode})` : ""}`);
    }
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        setError(error.message);
        setIsLoading(false);
      }
    } catch (e) {
      setError(String(e));
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#1a1a1a] border border-white/10 p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-14 w-14 rounded-2xl bg-[#32a893] grid place-items-center mb-2">
            <span className="text-xl font-black text-white">RS</span>
          </div>
          <h2 className="text-lg font-semibold text-white">Welcome to WinLo Forecast</h2>
          <p className="text-sm text-gray-400">Sign in to continue</p>
          {error && (
            <p className="text-xs text-red-400 bg-red-900/30 p-2 rounded mt-2">
              {error}. Check Supabase Google OAuth config.
            </p>
          )}
        </div>

        <button
          onClick={signInWithGoogle}
          disabled={isLoading}
          className="mt-6 w-full flex items-center justify-center gap-3 rounded-xl bg-white text-gray-800 font-medium py-3 hover:bg-gray-100 active:scale-[0.98] transition disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
            <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5.1c-1.9 1.4-4.3 2.2-6.9 2.2-5.2 0-9.6-3.1-11.3-7.4l-6.5 5C9.6 39 16.2 43.5 24 43.5z" />
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.4 4.3-4.4 5.6l6 5.1C40.7 35.6 43.5 30.3 43.5 24c0-1.2-.1-2.3.1-3.5z" />
          </svg>
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const errorMsg = urlParams.get("error");

      if (errorMsg) {
        setError(decodeURIComponent(errorMsg));
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
        return;
      }

      if (token) {
        localStorage.setItem("auth_token", token);
        window.location.href = "/";
      } else {
        setError("Authentication token not received");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Sign in failed</div>
          <div className="text-gray-600">{error}</div>
          <div className="text-sm text-gray-400 mt-2">Redirecting to home in 3 seconds...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <div className="text-gray-600">Signing in...</div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const errorMsg = urlParams.get("error");

    if (errorMsg) {
      setError(decodeURIComponent(errorMsg));
      setTimeout(() => router.push("/"), 3000);
      return;
    }

    if (token) {
      // 保存token到localStorage
      localStorage.setItem("auth_token", token);
      // 跳转到首页
      router.push("/");
    } else {
      setError("未收到认证token");
      setTimeout(() => router.push("/"), 3000);
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">登录失败</div>
          <div className="text-gray-600">{error}</div>
          <div className="text-sm text-gray-400 mt-2">3秒后返回首页...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <div className="text-gray-600">正在登录...</div>
      </div>
    </div>
  );
}

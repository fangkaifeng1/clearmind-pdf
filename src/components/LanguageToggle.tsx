"use client";

import { useI18n } from "@/lib/i18n";

export default function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "zh" : "en")}
      className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      title={lang === "en" ? "切换到中文" : "Switch to English"}
    >
      <span className={`text-sm ${lang === "en" ? "text-blue-600 font-semibold" : ""}`}>
        EN
      </span>
      <span className="text-gray-300">/</span>
      <span className={`text-sm ${lang === "zh" ? "text-blue-600 font-semibold" : ""}`}>
        中
      </span>
    </button>
  );
}

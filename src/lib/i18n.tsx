"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "zh";

const STORAGE_KEY = "clearmind_lang";

const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Header
    "header.subtitle": "PDF to Markdown",
    "header.download": "Download",
    "header.copied": "Copied",
    "header.copy": "Copy",
    "header.new": "New",
    "header.backToUpload": "Back to upload",

    // Trust badges
    "trust.secure": "Secure Processing",
    "trust.seconds": "Ready in Seconds",
    "trust.device": "Works on Any Device",
    "trust.storage": "Files Not Stored",

    // Hero
    "hero.badge": "Built for Obsidian, Notion & AI workflows",
    "hero.title1": "Turn any PDF into",
    "hero.title2": "clean, structured Markdown",
    "hero.desc": "Upload a PDF, get perfectly formatted Markdown with headings, lists, and tables. Preview side-by-side, then export to your favorite tool.",

    // Upload
    "upload.drop": "Drop your PDF here, or",
    "upload.browse": "browse",
    "upload.formats": "Supports PDF, DOCX, PPTX, XLSX",
    "upload.selected": "Click to change",
    "upload.convert": "Convert to Markdown",
    "upload.converting": "Converting...",

    // How it works
    "how.title": "How it works",
    "how.subtitle": "Three steps to perfectly structured notes",
    "how.upload": "Upload",
    "how.uploadDesc": "Drag & drop your PDF file",
    "how.convert": "Convert",
    "how.convertDesc": "AI-powered structure extraction",
    "how.download": "Download",
    "how.downloadDesc": "Get clean Markdown output",

    // Features
    "features.title": "Why ClearMind PDF?",
    "features.subtitle": "Designed for people who work with knowledge",
    "features.markdown": "Structured Markdown",
    "features.markdownDesc": "Clean headings, lists, and tables — ready for Obsidian, Notion, or any Markdown editor.",
    "features.preview": "Side-by-Side Preview",
    "features.previewDesc": "Compare original PDF and converted Markdown instantly with our live preview.",
    "features.fast": "Fast & Private",
    "features.fastDesc": "Converted in seconds. Your files are processed securely and never stored.",

    // Pricing
    "pricing.title": "Simple, transparent pricing",
    "pricing.subtitle": "Start free. Upgrade when you need more power.",
    "pricing.popular": "Most Popular",
    "pricing.comingSoon": "Coming Soon",
    "pricing.free": "Free",
    "pricing.signedIn": "Signed In",
    "pricing.pro": "Pro",
    "pricing.forever": "forever",
    "pricing.month": "month",
    "pricing.freeCredits": "1 credit / day",
    "pricing.signedInCredits": "2 credits / day",
    "pricing.proCredits": "10 credits / day",
    "pricing.freeF1": "Basic PDF conversion",
    "pricing.freeF2": "Markdown output with frontmatter",
    "pricing.freeF3": "Side-by-side preview",
    "pricing.freeF4": "No account needed",
    "pricing.signedInF1": "Everything in Free",
    "pricing.signedInF2": "2x daily credits",
    "pricing.signedInF3": "Google sign-in",
    "pricing.signedInF4": "Conversion history",
    "pricing.proF1": "Everything in Signed In",
    "pricing.proF2": "10x daily credits",
    "pricing.proF3": "Priority processing",
    "pricing.proF4": "Email support",
    "pricing.getCta": "Get Started",
    "pricing.signInCta": "Sign in Free",
    "pricing.proCta": "Coming Soon",

    // Credits
    "credits.label": "credits",
    "credits.signInForMore": "Sign in for more",

    // Quota modal
    "quota.title": "Daily credits exhausted",
    "quota.desc": "You've used all {limit} of your daily credits. Sign in to get more, or upgrade to Pro for 10 credits per day.",
    "quota.signIn": "Sign in for more credits",
    "quota.upgrade": "Upgrade to Pro (Coming Soon)",

    // Result view
    "result.pdfOriginal": "PDF Original",
    "result.markdownPreview": "Markdown Preview",
    "result.rendering": "Rendering PDF...",

    // Footer
    "footer.copy": "ClearMind PDF. Free to use. No files stored.",

    // User menu
    "user.signIn": "Sign in",
    "user.signOut": "Sign out",

    // Auth callback
    "auth.failed": "Sign in failed",
    "auth.redirecting": "Redirecting to home in 3 seconds...",
    "auth.signingIn": "Signing in...",
    "auth.noToken": "Authentication token not received",

    // Toast
    "toast.pdfOnly": "Please upload a PDF file",
    "toast.expired": "Session expired, please sign in again",
    "toast.convertFailed": "Conversion failed",
    "toast.backendDown": "Conversion failed. Please check if the backend service is running.",
    "toast.success": "Conversion successful!",

    // Keys used by page.tsx directly
    "upload.dropSub": "or drag and drop here",
    "upload_pdf_only": "Please upload a PDF file",
    "login_required": "Please sign in first",
    "convert_failed": "Conversion failed",
    "server_error": "Server error ({status})",
  },
  zh: {
    // Header
    "header.subtitle": "PDF 转 Markdown",
    "header.download": "下载",
    "header.copied": "已复制",
    "header.copy": "复制",
    "header.new": "新建",
    "header.backToUpload": "返回上传",

    // Trust badges
    "trust.secure": "安全处理",
    "trust.seconds": "秒级转换",
    "trust.device": "全设备支持",
    "trust.storage": "文件不存储",

    // Hero
    "hero.badge": "专为 Obsidian、Notion 和 AI 工作流打造",
    "hero.title1": "将任意 PDF 转换为",
    "hero.title2": "整洁、结构化的 Markdown",
    "hero.desc": "上传 PDF，即刻获得带有标题、列表和表格的完美格式 Markdown。左右对照预览，一键导出至你喜爱的工具。",

    // Upload
    "upload.drop": "将 PDF 拖拽到此处，或",
    "upload.browse": "点击上传",
    "upload.formats": "支持 PDF、DOCX、PPTX、XLSX",
    "upload.selected": "点击更换文件",
    "upload.convert": "转换为 Markdown",
    "upload.converting": "正在转换...",
    "upload.dropSub": "或拖拽文件到此处",
    "upload_pdf_only": "请上传 PDF 文件",
    "login_required": "请先登录后再转换",
    "convert_failed": "转换失败",
    "server_error": "服务器错误 ({status})",

    // How it works
    "how.title": "工作原理",
    "how.subtitle": "三步完成结构化笔记转换",
    "how.upload": "上传",
    "how.uploadDesc": "拖拽上传 PDF 文件",
    "how.convert": "转换",
    "how.convertDesc": "AI 驱动的结构提取",
    "how.download": "下载",
    "how.downloadDesc": "获取整洁的 Markdown",

    // Features
    "features.title": "为什么选择 ClearMind PDF？",
    "features.subtitle": "为知识工作者量身打造",
    "features.markdown": "结构化 Markdown",
    "features.markdownDesc": "清晰的标题、列表和表格 — 可直接用于 Obsidian、Notion 或任意 Markdown 编辑器。",
    "features.preview": "左右对照预览",
    "features.previewDesc": "即时对比原始 PDF 和转换后的 Markdown。",
    "features.fast": "快速且私密",
    "features.fastDesc": "秒级转换，文件安全处理且绝不留存。",

    // Pricing
    "pricing.title": "简单透明的定价",
    "pricing.subtitle": "免费开始，按需升级。",
    "pricing.popular": "最受欢迎",
    "pricing.comingSoon": "即将推出",
    "pricing.free": "免费版",
    "pricing.signedIn": "登录版",
    "pricing.pro": "专业版",
    "pricing.forever": "永久",
    "pricing.month": "月",
    "pricing.freeCredits": "1 次额度 / 天",
    "pricing.signedInCredits": "2 次额度 / 天",
    "pricing.proCredits": "10 次额度 / 天",
    "pricing.freeF1": "基础 PDF 转换",
    "pricing.freeF2": "含 Frontmatter 的 Markdown 输出",
    "pricing.freeF3": "左右对照预览",
    "pricing.freeF4": "无需注册",
    "pricing.signedInF1": "包含免费版所有功能",
    "pricing.signedInF2": "每日 2 倍额度",
    "pricing.signedInF3": "Google 登录",
    "pricing.signedInF4": "转换历史记录",
    "pricing.proF1": "包含登录版所有功能",
    "pricing.proF2": "每日 10 倍额度",
    "pricing.proF3": "优先处理",
    "pricing.proF4": "邮件支持",
    "pricing.getCta": "开始使用",
    "pricing.signInCta": "免费登录",
    "pricing.proCta": "即将推出",

    // Credits
    "credits.label": "额度",
    "credits.signInForMore": "登录获取更多",

    // Quota modal
    "quota.title": "今日额度已用完",
    "quota.desc": "你已用完今日 {limit} 次额度。登录即可获取更多，或升级为专业版享受每日 10 次额度。",
    "quota.signIn": "登录获取更多额度",
    "quota.upgrade": "升级为专业版（即将推出）",

    // Result view
    "result.pdfOriginal": "PDF 原文",
    "result.markdownPreview": "Markdown 预览",
    "result.rendering": "正在渲染 PDF...",

    // Footer
    "footer.copy": "ClearMind PDF。免费使用。文件不存储。",

    // User menu
    "user.signIn": "登录",
    "user.signOut": "退出登录",

    // Auth callback
    "auth.failed": "登录失败",
    "auth.redirecting": "3 秒后返回首页...",
    "auth.signingIn": "正在登录...",
    "auth.noToken": "未收到认证令牌",

    // Toast
    "toast.pdfOnly": "请上传 PDF 文件",
    "toast.expired": "会话已过期，请重新登录。",
    "toast.convertFailed": "转换失败",
    "toast.backendDown": "转换失败，请检查后端服务是否运行。",
    "toast.success": "转换成功！",
  },
};

type I18nContextValue = {
  lang: Lang;
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLang: (lang: Lang) => void;
};

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  t: (key) => key,
  setLang: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
    if (stored === "zh" || stored === "en") {
      setLangState(stored);
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("zh")) {
        setLangState("zh");
      }
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
    document.documentElement.lang = newLang === "zh" ? "zh-CN" : "en";
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let value = translations[lang]?.[key] || translations.en[key] || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  };

  return (
    <I18nContext.Provider value={{ lang, t, setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

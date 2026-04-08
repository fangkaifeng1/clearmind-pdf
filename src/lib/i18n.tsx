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
    "upload.formats": "Supports PDF",
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
    "pricing.proCredits": "50 credits / day",
    "pricing.freeF1": "Basic PDF conversion",
    "pricing.freeF2": "Markdown output with frontmatter",
    "pricing.freeF3": "Side-by-side preview",
    "pricing.freeF4": "No account needed",
    "pricing.signedInF1": "Everything in Free",
    "pricing.signedInF2": "2x daily credits",
    "pricing.signedInF3": "Google sign-in",
    "pricing.signedInF4": "Conversion history",
    "pricing.proF1": "Everything in Signed In",
    "pricing.proF2": "50 credits per day",
    "pricing.proF3": "Priority processing speed",
    "pricing.proF4": "Batch processing (up to 10 files)",
    "pricing.proF5": "Advanced table extraction",
    "pricing.proF6": "Priority email support",
    "pricing.getCta": "Get Started",
    "pricing.signInCta": "Sign in Free",
    "pricing.proCta": "Coming Soon",
    "pricing.subscribeNow": "Subscribe Now",
    "pricing.cancelAnytime": "Cancel anytime",

    // Credits
    "credits.label": "credits",
    "credits.signInForMore": "Sign in for more",

    // Quota modal
    "quota.title": "Daily credits exhausted",
    "quota.desc": "You've used all {limit} of your daily credits. Sign in to get more daily credits.",
    "quota.signIn": "Sign in for more credits",
    "quota.gotIt": "Got it",

    // Result view
    "result.pdfOriginal": "PDF Original",
    "result.markdownPreview": "Markdown Preview",
    "result.rendering": "Rendering PDF...",

    // Footer
    "footer.copy": "ClearMind PDF. Free to use. No files stored.",
    "footer.brandDesc": "Transform your PDFs into clean, structured Markdown. Built for researchers, writers, and knowledge workers who value clarity and efficiency.",
    "footer.product": "Product",
    "footer.features": "Features",
    "footer.pricing": "Pricing",
    "footer.apiDocs": "API Docs",
    "footer.changelog": "Changelog",
    "footer.support": "Support",
    "footer.helpCenter": "Help Center",
    "footer.contactUs": "Contact Us",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.rights": "All rights reserved.",
    "footer.allSystemsNormal": "All systems operational",

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

    // Use cases
    "usecases.title": "Built for the tools you already love",
    "usecases.subtitle": "Seamlessly integrate with your favorite knowledge management workflow",
    "usecases.obsidian": "Obsidian",
    "usecases.obsidianDesc": "Paste converted Markdown directly into your vault. Preserves headings, links, and structure.",
    "usecases.notion": "Notion",
    "usecases.notionDesc": "Import clean Markdown that Notion understands. Tables, lists, and formatting intact.",
    "usecases.ai": "AI Workflows",
    "usecases.aiDesc": "Feed structured text to ChatGPT, Claude, or any LLM for summarization and analysis.",
    "usecases.research": "Research Papers",
    "usecases.researchDesc": "Convert academic PDFs to searchable, editable Markdown for notes and citations.",

    // Stats / social proof
    "stats.conversions": "PDFs Converted",
    "stats.users": "Active Users",
    "stats.accuracy": "Format Accuracy",
    "stats.uptime": "Uptime",

    // Testimonials
    "testimonials.title": "Loved by knowledge workers",
    "testimonials.subtitle": "See what people are saying about ClearMind PDF",
    "testimonials.1.text": "Finally a PDF converter that actually preserves the structure. My Obsidian vault has never been more organized.",
    "testimonials.1.name": "Sarah Chen",
    "testimonials.1.role": "Research Scientist",
    "testimonials.2.text": "I convert dozens of research papers daily. ClearMind saves me hours of manual formatting every week.",
    "testimonials.2.name": "Marcus Rivera",
    "testimonials.2.role": "PhD Student",
    "testimonials.3.text": "The side-by-side preview is brilliant. I can instantly verify the conversion quality before exporting.",
    "testimonials.3.name": "Emily Zhang",
    "testimonials.3.role": "Technical Writer",

    // CTA section
    "cta.title": "Ready to transform your PDFs?",
    "cta.subtitle": "Start converting for free. No credit card required. No files stored.",
    "cta.button": "Get Started Free",

    // Features extended
    "features.batch": "Batch Processing",
    "features.batchDesc": "Convert multiple PDFs at once with queue management and progress tracking.",
    "features.tables": "Table Extraction",
    "features.tablesDesc": "Preserves complex table structures including merged cells, headers, and nested data.",
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
    "upload.formats": "支持 PDF",
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
    "pricing.proCredits": "50 次额度 / 天",
    "pricing.freeF1": "基础 PDF 转换",
    "pricing.freeF2": "含 Frontmatter 的 Markdown 输出",
    "pricing.freeF3": "左右对照预览",
    "pricing.freeF4": "无需注册",
    "pricing.signedInF1": "包含免费版所有功能",
    "pricing.signedInF2": "每日 2 倍额度",
    "pricing.signedInF3": "Google 登录",
    "pricing.signedInF4": "转换历史记录",
    "pricing.proF1": "包含登录版所有功能",
    "pricing.proF2": "每日 50 次额度",
    "pricing.proF3": "优先处理速度",
    "pricing.proF4": "批量处理（最多 10 个文件）",
    "pricing.proF5": "高级表格提取",
    "pricing.proF6": "优先邮件支持",
    "pricing.getCta": "开始使用",
    "pricing.signInCta": "免费登录",
    "pricing.proCta": "即将推出",
    "pricing.subscribeNow": "立即订阅",
    "pricing.cancelAnytime": "随时可取消",

    // Credits
    "credits.label": "额度",
    "credits.signInForMore": "登录获取更多",

    // Quota modal
    "quota.title": "今日额度已用完",
    "quota.desc": "你已用完今日 {limit} 次额度。登录即可获取更多每日额度。",
    "quota.signIn": "登录获取更多额度",
    "quota.gotIt": "知道了",

    // Result view
    "result.pdfOriginal": "PDF 原文",
    "result.markdownPreview": "Markdown 预览",
    "result.rendering": "正在渲染 PDF...",

    // Footer
    "footer.copy": "ClearMind PDF。免费使用。文件不存储。",
    "footer.brandDesc": "将 PDF 转换为整洁、结构化的 Markdown。专为研究人员、写作爱好者和知识工作者打造。",
    "footer.product": "产品",
    "footer.features": "功能特性",
    "footer.pricing": "定价方案",
    "footer.apiDocs": "API 文档",
    "footer.changelog": "更新日志",
    "footer.support": "支持",
    "footer.helpCenter": "帮助中心",
    "footer.contactUs": "联系我们",
    "footer.privacy": "隐私政策",
    "footer.terms": "服务条款",
    "footer.rights": "保留所有权利。",
    "footer.allSystemsNormal": "所有系统运行正常",

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

    // Use cases
    "usecases.title": "为你常用的工具而生",
    "usecases.subtitle": "无缝融入你的知识管理工作流",
    "usecases.obsidian": "Obsidian",
    "usecases.obsidianDesc": "将转换后的 Markdown 直接粘贴到你的笔记库。标题、链接、结构完美保留。",
    "usecases.notion": "Notion",
    "usecases.notionDesc": "导入 Notion 可识别的整洁 Markdown。表格、列表和格式完整无缺。",
    "usecases.ai": "AI 工作流",
    "usecases.aiDesc": "将结构化文本直接输入 ChatGPT、Claude 等大模型进行摘要和分析。",
    "usecases.research": "研究论文",
    "usecases.researchDesc": "将学术论文 PDF 转换为可搜索、可编辑的 Markdown 笔记和引用。",

    // Stats / social proof
    "stats.conversions": "PDF 已转换",
    "stats.users": "活跃用户",
    "stats.accuracy": "格式准确率",
    "stats.uptime": "在线率",

    // Testimonials
    "testimonials.title": "深受知识工作者喜爱",
    "testimonials.subtitle": "听听用户怎么说",
    "testimonials.1.text": "终于有一款能真正保留结构的 PDF 转换器了。我的 Obsidian 笔记库从没这么整洁过。",
    "testimonials.1.name": "Sarah Chen",
    "testimonials.1.role": "研究科学家",
    "testimonials.2.text": "我每天转换几十篇研究论文，ClearMind 每周帮我节省数小时的手动排版时间。",
    "testimonials.2.name": "Marcus Rivera",
    "testimonials.2.role": "博士生",
    "testimonials.3.text": "左右对照预览功能太棒了，可以即时验证转换质量再导出。",
    "testimonials.3.name": "Emily Zhang",
    "testimonials.3.role": "技术写作工程师",

    // CTA section
    "cta.title": "准备好转换你的 PDF 了吗？",
    "cta.subtitle": "免费开始转换，无需信用卡，文件绝不留存。",
    "cta.button": "免费开始",

    // Features extended
    "features.batch": "批量处理",
    "features.batchDesc": "一次转换多个 PDF，支持队列管理和进度追踪。",
    "features.tables": "表格提取",
    "features.tablesDesc": "保留复杂表格结构，包括合并单元格、表头和嵌套数据。",
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

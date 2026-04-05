"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  Download,
  Copy,
  Check,
  Eye,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  CheckCircle,
  Brain,
  Shield,
  Zap,
  Monitor,
  Trash2,
  ArrowRight,
  FileOutput,
  Type,
  LayoutGrid,
  Lock,
  Clock
} from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { authFetch, getToken, loginWithGoogle } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "@/components/LanguageToggle";
import CreditsDisplay from "@/components/CreditsDisplay";
import QuotaExhaustedModal from "@/components/QuotaExhaustedModal";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import { getClientId, fetchQuota, QuotaInfo } from "@/lib/quota";
import { ToastProvider, useToast } from "@/components/Toast";

// 缓存 pdfjs-dist 模块，避免重复加载
let pdfjsLibCache: any = null;
async function getPdfjsLib() {
  if (pdfjsLibCache) return pdfjsLibCache;
  const lib = await import("pdfjs-dist");
  lib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  pdfjsLibCache = lib;
  return lib;
}

export default function Home() {
  const { t } = useI18n();
  // Toast通知
  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    // 创建Toast元素
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
      type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
    } animate-in slide-in-from-right`;
    toast.innerHTML = `
      <span class="text-sm font-medium">${message}</span>
      <button onclick="this.parentElement.remove()" class="hover:opacity-75">✕</button>
    `;
    document.body.appendChild(toast);
    
    // 3秒后自动消失
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [pdfTextContent, setPdfTextContent] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);

  const pdfCanvasRef = useRef<HTMLDivElement>(null);

  // 当文件变化时，渲染 PDF
  useEffect(() => {
    if (file && markdown) {
      // 等待 DOM 渲染完成后再渲染 PDF
      const timer = setTimeout(() => {
        renderPdf(file);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [file, markdown]);

  useEffect(() => {
    const loadQuota = async () => { setQuota(await fetchQuota()); };
    loadQuota();
    const iv = setInterval(loadQuota, 5000);
    return () => clearInterval(iv);
  }, []);

  const renderPdf = async (pdfFile: File) => {
    const container = pdfCanvasRef.current;
    if (!container) {
      console.warn("PDF container not ready, retrying...");
      setTimeout(() => renderPdf(pdfFile), 200);
      return;
    }

    setPdfLoading(true);
    try {
      // 确保 pdfjs-dist 已加载
      const pdfjsLib = await getPdfjsLib();
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      const numPages = pdf.numPages;

      // 清空之前的 canvas（这个 div 完全由 JS 管理，不受 React 控制）
      container.innerHTML = '';
      
      for (let i = 1; i <= Math.min(numPages, 20); i++) { // 最多渲染 20 页
        const page = await pdf.getPage(i);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        
        // 创建 canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'pdf-page-canvas';
        canvas.style.marginBottom = '16px';
        canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        canvas.style.borderRadius = '8px';
        
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
        }

        container.appendChild(canvas);
        
        // 提取文本
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }
      
      setPdfTextContent(fullText);
    } catch (error) {
      console.error("PDF 渲染错误:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        showToast(t("upload_pdf_only"), "error");
        return;
      }
      setFile(selectedFile);
      setMarkdown("");
      setPdfTextContent("");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setMarkdown("");
      setPdfTextContent("");
    } else {
      showToast(t("upload_pdf_only"), "error");
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    if (quota && quota.remaining <= 0) {
      setShowQuotaModal(true);
      return;
    }

    // 检查是否已登录
    const token = getToken();
    if (!token) {
      showToast(t("login_required"), "error");
      setTimeout(() => {
        loginWithGoogle();
      }, 1500);
      return;
    }
    
    setLoading(true);
    setUploadedFileName(file.name);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("client_id", getClientId());

      // 直接请求后端，不通过 Next.js API Route
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://43.163.107.29:8000";
      const response = await authFetch(`${backendUrl}/convert`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = t("convert_failed");
        let quotaData = null;
        try {
          const errData = JSON.parse(text);
          errorMsg = errData.error || errorMsg;
          quotaData = errData.quota || null;
        } catch {
          errorMsg = t("server_error", { status: response.status });
        }

        // Handle 429 quota exceeded
        if (response.status === 429) {
          if (quotaData) setQuota(quotaData);
          else setQuota(await fetchQuota());
          setShowQuotaModal(true);
          setMarkdown("");
          return;
        }

        // Handle 401 expired
        if (response.status === 401) {
          showToast(t("toast.expired"), "error");
          setTimeout(() => {
            loginWithGoogle();
          }, 1500);
        } else {
          showToast(errorMsg, "error");
        }

        setMarkdown("");
        return;
      }

      const data = await response.json();

      if (data.error) {
        showToast(t("convert_failed") + ": " + data.error, "error");
        setMarkdown("");
      } else {
        setMarkdown(data.markdown);
        if (data.quota) setQuota(data.quota);
        else setQuota(await fetchQuota());
        showToast(t("toast.success"), "success");
      }
    } catch (error) {
      console.error("转换错误:", error);
      showToast(t("toast.backendDown"), "error");
      setMarkdown("");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file?.name.replace(/\.pdf$/i, ".md") || "output.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setFile(null);
    setMarkdown("");
    setUploadedFileName("");
    setPdfTextContent("");
    if (pdfCanvasRef.current) {
      pdfCanvasRef.current.innerHTML = '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      {showQuotaModal && quota && (
        <QuotaExhaustedModal
          quota={quota}
          onClose={() => setShowQuotaModal(false)}
          onSignIn={() => { setShowQuotaModal(false); loginWithGoogle(); }}
        />
      )}
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {markdown && (
              <button
                onClick={handleReset}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={t("header.backToUpload")}
              >
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ClearMind PDF
                </h1>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t("header.subtitle")}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {markdown && (
              <>
                <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all font-medium"
              >
                <Download className="w-4 h-4" />
                {t("header.download")} .md
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="font-medium">{copied ? t("header.copied") : t("header.copy")}</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">{t("header.new")}</span>
              </button>
            </>
            )}
            <CreditsDisplay quota={quota} onSignIn={loginWithGoogle} />
            <LanguageToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {!markdown ? (
          /* 上传界面 - Landing Page */
          <>
            {/* Hero Section */}
            <section className="relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/20 to-purple-100/20 rounded-full blur-3xl"></div>
              </div>

              <div className="max-w-4xl mx-auto px-6 pt-20 pb-16">
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100/80 text-blue-700 rounded-full text-sm font-medium mb-6 backdrop-blur">
                    <Sparkles className="w-4 h-4" />
                    {t("hero.badge")}
                  </div>
                  <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-5 leading-tight tracking-tight">
                    {t("hero.title1")}<br />
                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {t("hero.title2")}
                    </span>
                  </h2>
                  <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">
                    {t("hero.desc")}
                  </p>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
                  {[
                    { icon: Shield, label: t("trust.secure") },
                    { icon: Clock, label: t("trust.seconds") },
                    { icon: Monitor, label: t("trust.device") },
                    { icon: Trash2, label: t("trust.storage") },
                  ].map((badge) => (
                    <div key={badge.label} className="flex items-center gap-2 px-3 py-1.5 bg-white/80 backdrop-blur border border-gray-100 rounded-full text-xs font-medium text-gray-600">
                      <badge.icon className="w-3.5 h-3.5 text-blue-500" />
                      {badge.label}
                    </div>
                  ))}
                </div>

                {/* Upload area */}
                <div className="relative mb-6 max-w-2xl mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-20"></div>
                  <div
                    className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer backdrop-blur ${
                      isDragging
                        ? "border-blue-500 bg-blue-50/70 ring-4 ring-blue-200"
                        : "border-gray-300 hover:border-blue-400 hover:bg-white/50 bg-white/70"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <Upload className="w-10 h-10 text-blue-500" />
                      </div>
                      {file ? (
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium">
                            <CheckCircle className="w-5 h-5" />
                            {file.name}
                          </div>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xl font-medium text-gray-700">{t("upload.drop")}</span>
                          <p className="text-gray-400 mt-2">{t("upload.dropSub")}</p>
                          <p className="text-xs text-gray-300 mt-3">{t("upload.formats")}</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Convert button */}
                <div className="max-w-2xl mx-auto mb-6">
                  <button
                    onClick={handleConvert}
                    disabled={!file || loading}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        {t("upload.converting")}
                      </>
                    ) : (
                      <>
                        {t("upload.convert")}
                        <ChevronRight className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </section>

            {/* How it works */}
            <section className="bg-white/60 backdrop-blur border-y border-gray-100">
              <div className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    {t("how.title")}
                  </h3>
                  <p className="text-gray-500">{t("how.subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    {
                      step: "01",
                      icon: Upload,
                      title: t("how.upload"),
                      desc: t("how.uploadDesc"),
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      step: "02",
                      icon: Sparkles,
                      title: t("how.convert"),
                      desc: t("how.convertDesc"),
                      color: "from-purple-500 to-purple-600",
                    },
                    {
                      step: "03",
                      icon: Download,
                      title: t("how.download"),
                      desc: t("how.downloadDesc"),
                      color: "from-pink-500 to-pink-600",
                    },
                  ].map((item) => (
                    <div key={item.step} className="relative text-center group">
                      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br shadow-lg flex items-center justify-center">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg`}>
                          <item.icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div className="inline-block px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-400 mb-3">
                        STEP {item.step}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="bg-gradient-to-b from-white/40 to-slate-50">
              <div className="max-w-5xl mx-auto px-6 py-20">
                <div className="text-center mb-14">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    {t("features.title")}
                  </h3>
                  <p className="text-gray-500">{t("features.subtitle")}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      icon: Type,
                      title: t("features.markdown"),
                      desc: t("features.markdownDesc"),
                      gradient: "from-blue-500 to-cyan-500",
                      bg: "bg-blue-50",
                    },
                    {
                      icon: LayoutGrid,
                      title: t("features.preview"),
                      desc: t("features.previewDesc"),
                      gradient: "from-purple-500 to-violet-500",
                      bg: "bg-purple-50",
                    },
                    {
                      icon: Lock,
                      title: t("features.fast"),
                      desc: t("features.fastDesc"),
                      gradient: "from-pink-500 to-rose-500",
                      bg: "bg-pink-50",
                    },
                  ].map((feature) => (
                    <div key={feature.title} className={`${feature.bg} border border-gray-100 rounded-2xl p-7 hover:shadow-lg hover:-translate-y-1 transition-all duration-300`}>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-md`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section className="bg-white/60 backdrop-blur border-t border-gray-100">
              <div className="max-w-5xl mx-auto px-6 py-20">
                <PricingSection />
              </div>
            </section>
          </>
        ) : (
          /* 双栏对照界面 */
          <div className="flex-1 flex">
            {/* 左侧：PDF 原文渲染 */}
            <div className="w-1/2 border-r border-gray-200 bg-gradient-to-br from-slate-100 to-slate-50 flex flex-col">
              <div className="px-5 py-4 bg-white/80 backdrop-blur border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">{t("result.pdfOriginal")}</span>
                    <p className="text-xs text-gray-500">{uploadedFileName}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
                {pdfLoading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("result.rendering")}
                  </div>
                )}
                {/* 这个 div 完全交给原生 JS 操作，React 不会管理它的子元素 */}
                <div ref={pdfCanvasRef} className="w-full flex flex-col items-center" />
              </div>
            </div>

            {/* 右侧：Markdown 编辑器 */}
            <div className="w-1/2 flex flex-col bg-white">
              <div className="px-5 py-4 bg-white border-b border-gray-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <Eye className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-semibold text-gray-800">{t("result.markdownPreview")}</span>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <div className="prose prose-sm max-w-none">
                  {markdown.split("\n").map((line, index) => (
                    <div
                      key={index}
                      className="py-0.5 px-2 -mx-2 rounded"
                    >
                      {line.startsWith("# ") ? (
                        <h1 className="text-xl font-bold text-gray-900">{line.slice(2)}</h1>
                      ) : line.startsWith("## ") ? (
                        <h2 className="text-lg font-bold text-gray-800">{line.slice(3)}</h2>
                      ) : line.startsWith("### ") ? (
                        <h3 className="text-base font-bold text-gray-700">{line.slice(4)}</h3>
                      ) : line.startsWith("> ") ? (
                        <blockquote className="border-l-4 border-blue-400 pl-4 text-gray-600 text-sm bg-blue-50 py-1 rounded-r">
                          {line.slice(2)}
                        </blockquote>
                      ) : line.startsWith("|") ? (
                        <code className="text-xs bg-gray-100 px-1 rounded font-mono">{line}</code>
                      ) : line.startsWith("```") ? (
                        <code className="text-xs text-gray-400 font-mono">{line}</code>
                      ) : line.startsWith("- ") ? (
                        <li className="text-sm text-gray-700 ml-4">{line.slice(2)}</li>
                      ) : line.match(/^\d+\./) ? (
                        <li className="text-sm text-gray-700 list-decimal ml-6">{line.replace(/^\d+\.\s*/, "")}</li>
                      ) : line.trim() === "" ? (
                        <br />
                      ) : (
                        <p className="text-sm text-gray-700">{line}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {!markdown && <Footer />}
    </div>
  );
}

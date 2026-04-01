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
  Brain
} from "lucide-react";
import UserMenu from "@/components/UserMenu";
import { authFetch, getToken } from "@/lib/auth";

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
  const [file, setFile] = useState<File | null>(null);
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [pdfTextContent, setPdfTextContent] = useState<string>("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

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
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
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
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setLoading(true);
    setUploadedFileName(file.name);
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // 直接请求后端，不通过 Next.js API Route
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://43.163.107.29:8000";
      const response = await authFetch(`${backendUrl}/convert`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = "转换失败";
        try {
          const errData = JSON.parse(text);
          errorMsg = errData.error || errorMsg;
        } catch {
          errorMsg = `服务端错误 (${response.status}): ${text}`;
        }
        alert(errorMsg);
        setMarkdown("");
        return;
      }

      const data = await response.json();

      if (data.error) {
        alert("转换失败: " + data.error);
        setMarkdown("");
      } else {
        setMarkdown(data.markdown);
      }
    } catch (error) {
      console.error("转换错误:", error);
      alert("转换失败，请检查后端服务是否运行");
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {markdown && (
              <button
                onClick={handleReset}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="返回上传"
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
                  PDF → 结构化笔记
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
                下载 .md
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                <span className="font-medium">{copied ? "已复制" : "复制"}</span>
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="font-medium">重新上传</span>
              </button>
            </>
            )}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {!markdown ? (
          /* 上传界面 */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-2xl">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  为 Obsidian / Notion 用户打造
                </div>
                <h2 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  将 PDF 转换为<br />
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    结构化笔记
                  </span>
                </h2>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  上传 PDF，自动转换为 Markdown，支持左右对照预览
                </p>
              </div>

              {/* 上传区域 */}
              <div className="relative mb-8">
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
                        <span className="text-xl font-medium text-gray-700">点击上传 PDF</span>
                        <p className="text-gray-400 mt-2">或拖拽文件到此处</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* 转换按钮 */}
              <button
                onClick={handleConvert}
                disabled={!file || loading}
                className="w-full py-5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    转换中...
                  </>
                ) : (
                  <>
                    开始转换
                    <ChevronRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </div>
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
                    <span className="font-semibold text-gray-800">PDF 原文</span>
                    <p className="text-xs text-gray-500">{uploadedFileName}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
                {pdfLoading && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    正在渲染 PDF...
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
                  <span className="font-semibold text-gray-800">Markdown 预览</span>
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
    </div>
  );
}

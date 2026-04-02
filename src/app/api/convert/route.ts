import { NextRequest, NextResponse } from "next/server";

// 后端 API 地址（从环境变量读取，不暴露 IP）
const BACKEND_URL = process.env.BACKEND_URL || "https://api.clearmindpdf.com";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "未找到文件" }, { status: 400 });
    }

    // 从请求头获取 token
    const authHeader = request.headers.get("Authorization");
    
    // 转发到 Python 后端
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const headers: HeadersInit = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(`${BACKEND_URL}/convert`, {
      method: "POST",
      body: backendFormData,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: data.detail || "转换失败"
      }, { status: response.status });
    }

    if (!data.success) {
      return NextResponse.json({
        error: data.error || "转换失败"
      }, { status: 500 });
    }

    return NextResponse.json({
      markdown: data.markdown,
      filename: data.filename,
      size: data.size,
      convertedAt: data.converted_at,
    });

  } catch (error) {
    console.error("转换错误:", error);
    return NextResponse.json({
      error: "转换服务连接失败，请确保后端服务正在运行"
    }, { status: 500 });
  }
}

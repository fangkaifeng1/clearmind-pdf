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

    // 转发到 Python 后端
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const response = await fetch(`${BACKEND_URL}/convert`, {
      method: "POST",
      body: backendFormData,
    });

    const data = await response.json();

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

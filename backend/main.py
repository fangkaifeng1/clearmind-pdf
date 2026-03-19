"""
ClearMind PDF Backend
PDF to Markdown conversion service using MarkItDown
"""

import os
import tempfile
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from markitdown import MarkItDown
from pydantic import BaseModel

app = FastAPI(
    title="ClearMind PDF API",
    description="PDF to Markdown conversion service",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 MarkItDown
md_converter = MarkItDown()


class ConvertResponse(BaseModel):
    """转换响应"""
    success: bool
    markdown: Optional[str] = None
    filename: str
    size: int
    converted_at: str
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    version: str
    timestamp: str


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查"""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )


@app.post("/convert", response_model=ConvertResponse)
async def convert_pdf_to_markdown(file: UploadFile = File(...)):
    """
    将 PDF 文件转换为 Markdown
    
    - 支持 PDF、DOCX、PPTX、XLSX 等格式
    - 返回结构化的 Markdown 内容
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="未提供文件")
    
    # 检查文件类型
    allowed_extensions = [".pdf", ".docx", ".pptx", ".xlsx", ".doc", ".ppt", ".xls"]
    file_ext = os.path.splitext(file.filename.lower())[1]
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"不支持的文件类型: {file_ext}。支持的类型: {', '.join(allowed_extensions)}"
        )
    
    try:
        # 保存到临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        # 使用 MarkItDown 转换
        result = md_converter.convert(tmp_path)
        markdown_content = result.text_content
        
        # 清理临时文件
        os.unlink(tmp_path)
        
        # 添加 Frontmatter
        frontmatter = f"""---
title: {os.path.splitext(file.filename)[0]}
source: {file.filename}
converted_at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
size: {len(content)} bytes
---

"""
        
        final_markdown = frontmatter + markdown_content
        
        return ConvertResponse(
            success=True,
            markdown=final_markdown,
            filename=file.filename,
            size=len(content),
            converted_at=datetime.now().isoformat(),
            error=None
        )
        
    except Exception as e:
        # 清理临时文件（如果存在）
        if 'tmp_path' in locals():
            try:
                os.unlink(tmp_path)
            except:
                pass
        
        return ConvertResponse(
            success=False,
            markdown=None,
            filename=file.filename,
            size=0,
            converted_at=datetime.now().isoformat(),
            error=str(e)
        )


@app.post("/convert/enhanced")
async def convert_with_enhancement(file: UploadFile = File(...)):
    """
    深度结构化转换（AI 增强）
    
    功能：
    - 自动提取 YAML Frontmatter
    - 按章节切片
    - 公式/代码块修复
    - 生成摘要
    """
    # 先做基础转换
    result = await convert_pdf_to_markdown(file)
    
    if not result.success:
        return result
    
    # TODO: 添加 AI 增强逻辑
    # - 提取标题、作者、年份
    # - 按章节切片
    # - 修复公式和代码块
    # - 生成摘要
    
    return {
        **result.model_dump(),
        "enhanced": True,
        "sections": [],
        "summary": None,
        "metadata": {}
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

"""
ClearMind PDF Backend
PDF to Markdown conversion service using MarkItDown
"""

import os
import tempfile
import logging
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from markitdown import MarkItDown
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 从环境变量读取配置
DEV_MODE = os.getenv("DEV_MODE", "production").lower() == "development"
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
ALLOWED_DOMAINS = os.getenv("ALLOWED_DOMAINS", "").split(",") if os.getenv("ALLOWED_DOMAINS") else []

app = FastAPI(
    title="ClearMind PDF API",
    description="PDF to Markdown conversion service",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://clearmindpdf.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 MarkItDown
md_converter = MarkItDown()


# ==================== 数据模型 ====================

class ConvertResponse(BaseModel):
    success: bool
    markdown: Optional[str] = None
    filename: str
    size: int
    converted_at: str
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str


class UserInfo(BaseModel):
    email: str
    name: str
    picture: str
    logged_in_at: datetime


# ==================== 鷻加鉴权中间件 ====================
class GoogleAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 开发模式跳过验证
        if DEV_MODE:
            logger.info("DEV_MODE enabled, skipping auth")
            request.state.user = UserInfo(
                email="dev@localhost",
                name="Developer",
                picture="",
                logged_in_at=datetime.now()
            )
            return await call_next(request)
        
        # 从 Header 获取 token
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            logger.warning("Missing Authorization header")
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing Authorization header"}
            )
        
        # 验证 token 格式
        if not auth_header.startswith("Bearer "):
            logger.warning(f"Invalid token format")
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token format"}
            )
        
        token = auth_header.replace("Bearer ", "")
        
        try:
            # 验证 Google token
            info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                GOOGLE_CLIENT_ID
            )
            
            # 检查邮箱是否在白名单中
            email = info.get("email")
            if ALLOWED_DOMAINS and email not in ALLOWED_DOMAINS:
                logger.warning(f"Email {email} not in whitelist")
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Email not in whitelist"}
                )
            
            # 存储用户信息
            request.state.user = UserInfo(
                email=info.get("email"),
                name=info.get("name"),
                picture=info.get("picture"),
                logged_in_at=datetime.now()
            )
            
            logger.info(f"User authenticated: {info.get('email')}")
            return await call_next(request)
            
        except Exception as e:
            logger.error(f"Auth error: {str(e)}")
            return JSONResponse(
                status_code=401,
                content={"detail": f"Authentication failed: {str(e)}"}
            )


# 注册中间件
app.add_middleware(GoogleAuthMiddleware)


# ==================== API 路由 ====================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查"""
    return HealthResponse(
        status="ok",
        version="1.0.0",
        timestamp=datetime.now().isoformat()
    )


def get_current_user(request: Request) -> UserInfo:
    """获取当前登录用户信息"""
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not logged in"
        )
    return user


@app.post("/convert", response_model=ConvertResponse)
async def convert_pdf_to_markdown(
    request: Request,
    file: UploadFile = File(...)
):
    """
    将 PDF 文件转换为 Markdown
    
    - 支持 PDF、DOCX、PPTX、XLSX 等格式
    - 返回结构化的 Markdown 内容
    """
    # 验证用户已登录
    user = get_current_user(request)
    logger.info(f"Convert request from: {user.email}")
    
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
    
    tmp_path = None
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
        if tmp_path:
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
        if tmp_path:
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

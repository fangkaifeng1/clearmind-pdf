"""
ClearMind PDF Backend
PDF to Markdown conversion service using MarkItDown
"""

import os
import tempfile
import logging
import sqlite3
import secrets
from datetime import datetime
from typing import Optional
from contextlib import contextmanager
from urllib.parse import urlencode

# 加载 .env 文件
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from markitdown import MarkItDown
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

# 配置日志 - 结构化 JSON 格式
import json
from datetime import datetime

# ==================== 数据库配置 ====================
DATABASE_PATH = os.getenv("DATABASE_PATH", "/root/.openclaw/workspace/clearmind-pdf/backend/analytics.db")

def init_database():
    """初始化数据库表"""
    conn = sqlite3.connect(DATABASE_PATH)
    cursor = conn.cursor()
    
    # 创建埋点事件表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            event_type TEXT NOT NULL,
            user_email TEXT,
            ip_address TEXT,
            user_agent TEXT,
            filename TEXT,
            file_type TEXT,
            file_size INTEGER,
            markdown_length INTEGER,
            processing_time REAL,
            error_type TEXT,
            error_message TEXT,
            extra_data TEXT
        )
    ''')
    
    # 创建索引
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_event_type ON analytics_events(event_type)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_user_email ON analytics_events(user_email)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_timestamp ON analytics_events(timestamp)')
    
    conn.commit()
    conn.close()
    logger_raw = logging.getLogger(__name__)
    logger_raw.info(f"Database initialized at {DATABASE_PATH}")

@contextmanager
def get_db():
    """数据库连接上下文管理器"""
    conn = sqlite3.connect(DATABASE_PATH)
    try:
        yield conn
    finally:
        conn.close()

def save_event_to_db(
    event_type: str,
    user_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    filename: Optional[str] = None,
    file_type: Optional[str] = None,
    file_size: Optional[int] = None,
    markdown_length: Optional[int] = None,
    processing_time: Optional[float] = None,
    error_type: Optional[str] = None,
    error_message: Optional[str] = None,
    extra_data: Optional[dict] = None
):
    """保存埋点事件到数据库"""
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO analytics_events (
                    timestamp, event_type, user_email, ip_address, user_agent,
                    filename, file_type, file_size, markdown_length, processing_time,
                    error_type, error_message, extra_data
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                datetime.now().isoformat(),
                event_type,
                user_email,
                ip_address,
                user_agent,
                filename,
                file_type,
                file_size,
                markdown_length,
                processing_time,
                error_type,
                error_message,
                json.dumps(extra_data, ensure_ascii=False) if extra_data else None
            ))
            conn.commit()
    except Exception as e:
        logger_raw = logging.getLogger(__name__)
        logger_raw.error(f"Failed to save event to database: {e}")

# 初始化数据库
init_database()

class StructuredLogger:
    """结构化日志记录器"""
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        
    def _log(self, level, event: str, **kwargs):
        """输出结构化 JSON 日志"""
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "event": event,
            **kwargs
        }
        message = json.dumps(log_data, ensure_ascii=False)
        if level == "INFO":
            self.logger.info(message)
        elif level == "WARNING":
            self.logger.warning(message)
        elif level == "ERROR":
            self.logger.error(message)
        elif level == "DEBUG":
            self.logger.debug(message)
    
    def info(self, event: str, **kwargs):
        self._log("INFO", event, **kwargs)
    
    def warning(self, event: str, **kwargs):
        self._log("WARNING", event, **kwargs)
    
    def error(self, event: str, **kwargs):
        self._log("ERROR", event, **kwargs)
    
    def debug(self, event: str, **kwargs):
        self._log("DEBUG", event, **kwargs)

logging.basicConfig(level=logging.INFO)
logger = StructuredLogger(__name__)

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


# ==================== 数据库保存辅助函数 ====================
def save_event_to_db(
    event_type: str,
    user_email: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    filename: Optional[str] = None,
    file_type: Optional[str] = None,
    file_size: Optional[int] = None,
    markdown_length: Optional[int] = None,
    processing_time: Optional[float] = None,
    error_type: Optional[str] = None,
    error_message: Optional[str] = None,
    extra_data: Optional[dict] = None
):
    """保存事件到数据库（包装函数）"""
    try:
        conn = sqlite3.connect(DATABASE_PATH)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO analytics_events (
                timestamp, event_type, user_email, ip_address, user_agent,
                filename, file_type, file_size, markdown_length, processing_time,
                error_type, error_message, extra_data
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            datetime.now().isoformat(),
            event_type,
            user_email,
            ip_address,
            user_agent,
            filename,
            file_type,
            file_size,
            markdown_length,
            processing_time,
            error_type,
            error_message,
            json.dumps(extra_data, ensure_ascii=False) if extra_data else None
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        logging.getLogger(__name__).error(f"Failed to save event to DB: {e}")


# ==================== 鷻加鉴权中间件 ====================
class GoogleAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 记录请求开始
        request.state.start_time = datetime.now()
        
        # OPTIONS 请求直接放行（CORS 预检）
        if request.method == "OPTIONS":
            return await call_next(request)
        
        # 白名单路径 - 不需要认证
        whitelist_paths = [
            "/health", 
            "/api/auth/google", 
            "/api/auth/callback/google",
            "/api/auth/me",
            "/api/auth/logout",
            "/"
        ]
        # 检查是否是白名单路径或以白名单开头
        if any(request.url.path == path or request.url.path.startswith(path + "/") for path in whitelist_paths):
            # 开发模式下记录埋点
            if DEV_MODE:
                logger.info("dev_mode_enabled", mode="development")
                save_event_to_db(
                    event_type="dev_mode_enabled",
                    ip_address=request.client.host if request.client else None,
                    user_agent=request.headers.get("user-agent")
                )
            request.state.user = UserInfo(
                email="dev@localhost",
                name="Developer",
                picture="",
                logged_in_at=datetime.now()
            )
            return await call_next(request)
        
        # 开发模式跳过验证
        if DEV_MODE:
            logger.info("dev_mode_enabled", mode="development")
            save_event_to_db(
                event_type="dev_mode_enabled",
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent")
            )
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
            logger.warning("auth_failed", 
                reason="missing_auth_header",
                path=request.url.path,
                ip=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent")
            )
            save_event_to_db(
                event_type="auth_failed",
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                error_type="missing_auth_header",
                error_message="Missing Authorization header",
                extra_data={"path": request.url.path}
            )
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing Authorization header"}
            )
        
        # 验证 token 格式
        if not auth_header.startswith("Bearer "):
            logger.warning("auth_failed",
                reason="invalid_token_format",
                path=request.url.path,
                ip=request.client.host if request.client else None
            )
            save_event_to_db(
                event_type="auth_failed",
                ip_address=request.client.host if request.client else None,
                error_type="invalid_token_format",
                extra_data={"path": request.url.path}
            )
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
                logger.warning("auth_failed",
                    reason="email_not_in_whitelist",
                    email=email,
                    ip=request.client.host if request.client else None
                )
                save_event_to_db(
                    event_type="auth_failed",
                    user_email=email,
                    ip_address=request.client.host if request.client else None,
                    error_type="email_not_in_whitelist"
                )
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
            
            # 记录认证成功
            logger.info("auth_success",
                email=info.get("email"),
                name=info.get("name"),
                ip=request.client.host if request.client else None
            )
            save_event_to_db(
                event_type="auth_success",
                user_email=info.get("email"),
                ip_address=request.client.host if request.client else None,
                user_agent=request.headers.get("user-agent"),
                extra_data={"name": info.get("name")}
            )
            return await call_next(request)
            
        except Exception as e:
            logger.error("auth_error",
                error_type=type(e).__name__,
                error_message=str(e),
                ip=request.client.host if request.client else None,
                path=request.url.path
            )
            save_event_to_db(
                event_type="auth_error",
                ip_address=request.client.host if request.client else None,
                error_type=type(e).__name__,
                error_message=str(e),
                extra_data={"path": request.url.path}
            )
            return JSONResponse(
                status_code=401,
                content={"detail": f"Authentication failed: {str(e)}"}
            )


# 注册中间件
app.add_middleware(GoogleAuthMiddleware)


# ==================== Google OAuth 配置 ====================
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "https://api.clearmindpdf.com/api/auth/callback/google")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://clearmindpdf.com")

# 存储 OAuth state（生产环境应该用 Redis）
oauth_states = {}


# ==================== API 路由 ====================

@app.get("/api/auth/google")
async def google_auth():
    """发起 Google OAuth 登录"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    # 生成随机 state 防止 CSRF
    state = secrets.token_urlsafe(32)
    oauth_states[state] = datetime.now().isoformat()
    
    # 构建 Google OAuth URL
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "offline",
        "prompt": "consent"
    }
    
    google_auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    
    logger.info("google_oauth_start", redirect_uri=GOOGLE_REDIRECT_URI)
    save_event_to_db(
        event_type="google_oauth_start",
        extra_data={"redirect_uri": GOOGLE_REDIRECT_URI}
    )
    
    return RedirectResponse(url=google_auth_url)


@app.get("/api/auth/callback/google")
async def google_auth_callback(code: str, state: str):
    """Google OAuth 回调"""
    # 验证 state
    if state not in oauth_states:
        logger.warning("google_oauth_invalid_state", state=state)
        save_event_to_db(event_type="google_oauth_invalid_state", extra_data={"state": state})
        raise HTTPException(status_code=400, detail="Invalid state")
    
    # 删除已使用的 state
    del oauth_states[state]
    
    try:
        # 用 code 换取 access token
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "code": code,
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        
        import requests as http_requests
        token_response = http_requests.post(token_url, data=token_data)
        
        if token_response.status_code != 200:
            logger.error("google_oauth_token_failed", 
                status_code=token_response.status_code,
                response=token_response.text
            )
            save_event_to_db(
                event_type="google_oauth_token_failed",
                error_message=token_response.text
            )
            raise HTTPException(status_code=400, detail="Failed to get token from Google")
        
        token_json = token_response.json()
        id_token_str = token_json.get("id_token")
        
        # 验证 id_token
        user_info = id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        email = user_info.get("email")
        name = user_info.get("name")
        picture = user_info.get("picture")
        
        # 检查白名单
        if ALLOWED_DOMAINS and email not in ALLOWED_DOMAINS:
            logger.warning("google_oauth_email_not_in_whitelist", email=email)
            save_event_to_db(
                event_type="google_oauth_email_not_in_whitelist",
                user_email=email
            )
            return RedirectResponse(url=f"{FRONTEND_URL}/?error=unauthorized")
        
        # 记录登录成功
        logger.info("google_oauth_success", email=email, name=name)
        save_event_to_db(
            event_type="google_oauth_success",
            user_email=email,
            extra_data={"name": name}
        )
        
        # 重定向到前端，带上 token
        frontend_callback_url = f"{FRONTEND_URL}/auth/callback?token={id_token_str}"
        return RedirectResponse(url=frontend_callback_url)
        
    except Exception as e:
        logger.error("google_oauth_error", error_type=type(e).__name__, error_message=str(e))
        save_event_to_db(
            event_type="google_oauth_error",
            error_type=type(e).__name__,
            error_message=str(e)
        )
        return RedirectResponse(url=f"{FRONTEND_URL}/?error=auth_failed")


@app.get("/api/auth/me")
async def get_current_user_info(request: Request):
    """获取当前用户信息"""
    auth_header = request.headers.get("Authorization")
    
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.replace("Bearer ", "")
    
    try:
        user_info = id_token.verify_oauth2_token(
            token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID
        )
        
        return {
            "success": True,
            "user": {
                "id": user_info.get("sub"),
                "email": user_info.get("email"),
                "name": user_info.get("name"),
                "picture": user_info.get("picture")
            }
        }
    except Exception as e:
        logger.error("auth_verify_error", error_message=str(e))
        raise HTTPException(status_code=401, detail="Invalid token")


@app.post("/api/auth/logout")
async def logout():
    """登出（客户端删除 token 即可）"""
    return {"success": True, "message": "Logged out"}


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
    
    # 记录转换开始
    start_time = datetime.now()
    file_size = 0
    
    logger.info("convert_start",
        filename=file.filename,
        user_email=user.email,
        ip=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    # 保存转换开始事件到数据库
    save_event_to_db(
        event_type="convert_start",
        user_email=user.email,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
        filename=file.filename
    )
    
    if not file.filename:
        logger.error("convert_failed", 
            reason="no_filename",
            user_email=user.email
        )
        save_event_to_db(
            event_type="convert_failed",
            user_email=user.email,
            error_type="no_filename",
            error_message="未提供文件"
        )
        raise HTTPException(status_code=400, detail="未提供文件")
    
    # 检查文件类型
    allowed_extensions = [".pdf", ".docx", ".pptx", ".xlsx", ".doc", ".ppt", ".xls"]
    file_ext = os.path.splitext(file.filename.lower())[1]
    
    if file_ext not in allowed_extensions:
        logger.warning("convert_failed",
            reason="unsupported_file_type",
            file_extension=file_ext,
            filename=file.filename,
            user_email=user.email
        )
        save_event_to_db(
            event_type="convert_failed",
            user_email=user.email,
            filename=file.filename,
            file_type=file_ext,
            error_type="unsupported_file_type",
            error_message=f"不支持的文件类型: {file_ext}"
        )
        raise HTTPException(
            status_code=400, 
            detail=f"不支持的文件类型: {file_ext}。支持的类型: {', '.join(allowed_extensions)}"
        )
    
    tmp_path = None
    convert_start_time = datetime.now()
    
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
        
        # 计算处理时长
        processing_time = (datetime.now() - convert_start_time).total_seconds()
        
        # 添加 Frontmatter
        frontmatter = f"""---
title: {os.path.splitext(file.filename)[0]}
source: {file.filename}
converted_at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
size: {len(content)} bytes
---

"""
        
        final_markdown = frontmatter + markdown_content
        
        # 记录转换成功
        logger.info("convert_success",
            filename=file.filename,
            file_size=len(content),
            file_type=file_ext,
            markdown_length=len(final_markdown),
            processing_time_seconds=round(processing_time, 2),
            user_email=user.email,
            ip=request.client.host if request.client else None
        )
        
        # 保存转换成功事件到数据库
        save_event_to_db(
            event_type="convert_success",
            user_email=user.email,
            ip_address=request.client.host if request.client else None,
            filename=file.filename,
            file_type=file_ext,
            file_size=len(content),
            markdown_length=len(final_markdown),
            processing_time=round(processing_time, 2)
        )
        
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
        
        # 计算处理时长
        processing_time = (datetime.now() - convert_start_time).total_seconds()
        
        # 记录失败埋点
        logger.error("convert_failed",
            filename=file.filename,
            file_type=file_ext,
            error_type=type(e).__name__,
            error_message=str(e),
            processing_time_seconds=round(processing_time, 2),
            user_email=user.email,
            ip=request.client.host if request.client else None
        )
        
        # 保存失败事件到数据库
        save_event_to_db(
            event_type="convert_failed",
            user_email=user.email,
            ip_address=request.client.host if request.client else None,
            filename=file.filename,
            file_type=file_ext,
            processing_time=round(processing_time, 2),
            error_type=type(e).__name__,
            error_message=str(e)
        )
        
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

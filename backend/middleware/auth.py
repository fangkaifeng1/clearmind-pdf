"""
Google OAuth 验证中间件
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import os
from typing import Optional
from datetime import datetime

# 白名单：允许这些域名无需登录
ALLOWED_DOMAINS = os.getenv("ALLOWED_DOMAINS", "").split(",") if os.getenv("ALLOWED_DOMAINS") else ["clearmindpdf.com"]

# 开发模式跳过验证
DEV_MODE = os.getenv("DEV_MODE", "production").lower() == "development"


class AuthMiddleware(BaseHTTPMiddleware):
    """验证 Google OAuth Token"""
    
    async def dispatch(self, request: Request, call_next):
        # 检查白名单（开发模式跳过）
        if DEV_MODE == "development":
            # 开发模式允许所有请求
            return await call_next()
        
        # 从 Header 获取 token
        token = request.headers.get("Authorization")
        if not token:
            raise HTTPException(
                status_code=401,
                detail="Missing Authorization header"
            )
        
        # 验证 token 格式: Bearer xxx
        if not token.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Invalid token format"
            )
        
        try:
            # 验证 Google token
            info = id_token.verify_oauth2_token(
                token,
                google_requests.Request(),
                clock_skew=google_requests,
            )
            
            # 检查邮箱是否在白名单中
            email = info.get("email")
            if ALLOWED_DOMAINS and email not in ALLOWED_DOMAINS:
                logger.warning(f"Unauthorized domain: {email}")
                raise HTTPException(
                    status_code=403,
                    detail=f"Access denied for domain: {email}"
                )
            
            # 将用户信息存入 request.state
            request.state.user = {
                "email": info.get("email"),
                "name": info.get("name"),
                "picture": info.get("picture"),
                "logged_in_at": datetime.now().isoformat()
            }
            
            await call_next()


# 获取用户信息的依赖
def get_current_user(request: Request) -> Optional[dict]:
    """获取当前登录用户信息"""
    user = request.state.user
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Not logged in"
        )
    return user

# ClearMind PDF 项目文档

## 🚀 项目概述
ClearMind PDF 是一个在线PDF转换工具，用户上传PDF文件后可一键转换为结构化的Markdown笔记。

**核心功能**：
- ✅ Google OAuth登录
- ✅ PDF上传和转换
- ✅ 左右对照预览（PDF & Markdown）
- ✅ 拖拽上传
- ✅ 实时预览

## 🔧 技术栈

**前端**：
- **Next.js 16.1.7** (React 19)
- **TailwindCSS 4.2.1**
- **pdfjs-dist** (PDF渲染)
- **Monaco Editor** (Markdown编辑器)
- **lucide-react** (图标库)
- **Google OAuth 2.0**

**后端**：
- **FastAPI**
- **Google OAuth 2.0**
- **JWT Token认证**

**部署**：
- 前端: Cloudflare Pages (https://clearmindpdf.com)
- 后端: 本地服务器
- API: https://api.clearmindpdf.com

## 📦 环境变量配置

### 前端环境变量
创建 `.env.local` 文件（本地开发）：
```env
NEXT_PUBLIC_BACKEND_URL=https://api.clearmindpdf.com
```

创建 `.env.production` 文件（生产环境）：
```env
NEXT_PUBLIC_BACKEND_URL=https://api.clearmindpdf.com
```

### 后端环境变量
创建 `.env` 文件（参考 `.env.example`）：
```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://clearmindpdf.com/api/auth/callback/google
JWT_SECRET_KEY=your_random_secret_key
```

⚠️ **重要**: 生产环境必须使用 `JWT_SECRET_KEY`，请勿使用默认值！

## 🚀 快速开始

### 前端
```bash
# 克隆项目
git clone https://github.com/fangkaifeng1/clearmind-pdf.git
cd clearmind-pdf

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 后端
```bash
# 克隆后端仓库
git clone https://github.com/fangkaifeng1/clearmind-pdf-backend.git
cd clearmind-pdf-backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env文件，填入你的凭证
vim .env

# 启动服务器
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🔐 认证流程

1. 用户访问 `/api/auth/google`
2. 后端生成state参数并重定向到Google授权页面
3. 用户在Google页面登录
4. Google重定向回 `/api/auth/callback/google?code=xxx&state=xxx`
5. 后端验证state、用code交换token
6. 后端验证Google token
7. 后端生成JWT token
8. 后端重定向到前端 `/auth/callback?token=xxx`
9. 前端保存token到localStorage
10. 前端跳转到首页
11. 后续请求带上 `Authorization: Bearer <token>`

## 🚀 部署指南

### 前端部署（Cloudflare Pages）

1. 连接GitHub仓库到Cloudflare Pages
2. 配置构建设置：
   - 构建命令: `npm run build`
   - 输出目录: `out`
3. 配置环境变量：
   - `NEXT_PUBLIC_BACKEND_URL`: https://api.clearmindpdf.com
4. 部署！

### 后端部署（本地服务器）

1. 在服务器上克隆仓库
2. 配置环境变量
3. 启动服务：
```bash
# 使用虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动服务（后台运行）
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > logs/uvicorn.log 2>&1 &
```

4. 配置Nginx反向代理（如果需要）
5. 配置域名解析

## 🔍 检查清单

部署完成后，运行以下检查：

```bash
# 检查后端健康状态
curl https://api.clearmindpdf.com/health

# 检查前端访问
curl https://clearmindpdf.com

# 测试登录流程
# 1. 访问 https://clearmindpdf.com
# 2. 点击"使用Google登录"
# 3. 完成 Google OAuth 授权
# 4. 验证跳转是否正确
# 5. 上传PDF测试
```

## 📊 监控和日志

后端日志位置：`logs/uvicorn.log`

查看日志：
```bash
tail -f logs/uvicorn.log
```

## 🐛 常见问题排查

### 401错误
**问题**：转换接口返回401 "Missing Authorization header"
**原因**：token不存在或已过期
**解决**：
1. 检查localStorage中的token
2. 清除浏览器缓存
3. 重新登录

### 转换失败
**问题**：PDF转换失败
**解决**：
1. 检查文件大小（限制10MB）
2. 检查文件格式（仅支持PDF）
3. 检查后端日志
4. 联系开发者

## 📝 维护记录

### 2026-04-01
- ✅ 集成Google OAuth认证
- ✅ 修复环境变量配置问题
- ✅ 添加401错误引导登录功能
- ✅ 创建项目文档
- ⚠️ 修复密钥泄露警告（移除README.md中的密钥）

## 📞 联系方式

- **开发者**：锋哥
- **助手**：小虾米 🦐
- **项目地址**：
  - 前端：https://github.com/fangkaifeng1/clearmind-pdf
  - 后端：https://github.com/fangkaifeng1/clearmind-pdf-backend
- **部署地址**：
  - 前端：https://clearmindpdf.com
  - 后端：https://api.clearmindpdf.com

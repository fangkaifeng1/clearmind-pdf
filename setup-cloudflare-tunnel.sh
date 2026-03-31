#!/bin/bash

# ClearMind PDF - Cloudflare Tunnel 配置脚本

echo "=== Cloudflare Tunnel 重新配置 ==="
echo ""

# 检查 cloudflared 是否安装
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared 未安装"
    exit 1
fi

echo "✅ cloudflared 已安装: $(cloudflared --version)"
echo ""

# 检查是否已经登录
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "⚠️  未找到 Cloudflare 证书，需要重新登录"
    echo ""
    echo "请运行以下命令："
    echo "  cloudflared tunnel login"
    echo ""
    echo "然后在浏览器中完成授权"
    exit 1
fi

echo "✅ 已找到 Cloudflare 证书"
echo ""

# 列出现有的 tunnel
echo "=== 现有的 Tunnel ==="
cloudflared tunnel list

echo ""
echo "=== 下一步操作 ==="
echo ""
echo "1. 如果已有 tunnel，记下 tunnel 名称或 ID"
echo "2. 创建配置文件："
echo "   nano ~/.cloudflared/config.yml"
echo ""
echo "3. 配置文件内容示例："
echo ""
cat << 'EOF'
tunnel: <your-tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: backend.clearmindpdf.com
    service: http://localhost:8000
  - service: http_status:404
EOF

echo ""
echo "4. 启动 tunnel："
echo "   cloudflared tunnel run <tunnel-name>"
echo ""
echo "5. 在 Cloudflare DNS 添加 CNAME 记录："
echo "   backend.clearmindpdf.com -> <tunnel-id>.cfargotunnel.com"
echo ""

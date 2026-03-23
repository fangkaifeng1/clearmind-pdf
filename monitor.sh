#!/bin/bash
# clearmind-pdf 服务监控脚本
# 检查后端和前端服务，挂了自动重启

BACKEND_DIR="/root/.openclaw/workspace/clearmind-pdf/backend"
FRONTEND_DIR="/root/.openclaw/workspace/clearmind-pdf"
LOG_FILE="/root/.openclaw/workspace/clearmind-pdf/monitor.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# 检查后端 (8000端口)
check_backend() {
    if ! lsof -i :8000 > /dev/null 2>&1; then
        log "后端服务挂了，正在重启..."
        cd "$BACKEND_DIR"
        source venv/bin/activate
        nohup python main.py > /dev/null 2>&1 &
        sleep 2
        if lsof -i :8000 > /dev/null 2>&1; then
            log "后端重启成功"
        else
            log "后端重启失败"
        fi
    fi
}

# 检查前端 (3000端口)
check_frontend() {
    if ! lsof -i :3000 > /dev/null 2>&1; then
        log "前端服务挂了，正在重启..."
        cd "$FRONTEND_DIR"
        nohup npm run dev > /dev/null 2>&1 &
        sleep 3
        if lsof -i :3000 > /dev/null 2>&1; then
            log "前端重启成功"
        else
            log "前端重启失败"
        fi
    fi
}

check_backend
check_frontend

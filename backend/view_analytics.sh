#!/bin/bash
# ClearMind PDF 埋点数据查看工具

DB_PATH="/root/.openclaw/workspace/clearmind-pdf/backend/analytics.db"

case "$1" in
    "all")
        echo "📋 所有埋点事件（最近50条）:"
        sqlite3 -header -column $DB_PATH "SELECT id, timestamp, event_type, user_email, filename, file_size, processing_time FROM analytics_events ORDER BY timestamp DESC LIMIT 50"
        ;;
    "stats")
        echo "📊 事件统计:"
        sqlite3 -header -column $DB_PATH "SELECT event_type, COUNT(*) as count FROM analytics_events GROUP BY event_type ORDER BY count DESC"
        ;;
    "convert")
        echo "🔄 转换记录:"
        sqlite3 -header -column $DB_PATH "SELECT timestamp, event_type, user_email, filename, file_size, processing_time FROM analytics_events WHERE event_type LIKE 'convert%' ORDER BY timestamp DESC LIMIT 20"
        ;;
    "auth")
        echo "🔐 认证记录:"
        sqlite3 -header -column $DB_PATH "SELECT timestamp, event_type, user_email, ip_address, error_type FROM analytics_events WHERE event_type LIKE 'auth%' ORDER BY timestamp DESC LIMIT 20"
        ;;
    "today")
        echo "📅 今日事件:"
        sqlite3 -header -column $DB_PATH "SELECT id, timestamp, event_type, user_email, filename FROM analytics_events WHERE date(timestamp) = date('now') ORDER BY timestamp DESC"
        ;;
    "export")
        OUTPUT="/root/.openclaw/workspace/analytics_$(date +%Y%m%d_%H%M%S).csv"
        sqlite3 -header -csv $DB_PATH "SELECT * FROM analytics_events" > "$OUTPUT"
        echo "✅ 已导出到: $OUTPUT"
        ;;
    *)
        echo "ClearMind PDF 埋点查看工具"
        echo ""
        echo "用法: $0 <命令>"
        echo ""
        echo "命令:"
        echo "  all      - 查看所有埋点（最近50条）"
        echo "  stats    - 按事件类型统计"
        echo "  convert  - 查看转换相关记录"
        echo "  auth     - 查看认证相关记录"
        echo "  today    - 查看今日事件"
        echo "  export   - 导出为 CSV 文件"
        ;;
esac

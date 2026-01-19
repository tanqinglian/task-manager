#!/bin/bash

# Tauri 应用调试脚本
# 使用方法: ./debug-app.sh

APP_PATH="/Applications/task-manager.app"
APP_NAME="task-manager"

echo "🔍 开始调试 Tauri 应用..."
echo ""

# 1. 检查应用是否存在
echo "📍 1. 检查应用是否存在..."
if [ -d "$APP_PATH" ]; then
    echo "✅ 应用已安装: $APP_PATH"
else
    echo "❌ 应用未找到: $APP_PATH"
    echo "   请先安装应用到 /Applications 目录"
    exit 1
fi

# 2. 检查应用签名
echo ""
echo "📋 2. 检查应用签名..."
codesign -dv "$APP_PATH" 2>&1 | head -5

# 3. 检查隔离属性
echo ""
echo "🔓 3. 检查应用隔离属性..."
QUARANTINE=$(xattr -l "$APP_PATH" | grep "com.apple.quarantine")
if [ -n "$QUARANTINE" ]; then
    echo "⚠️  应用被隔离，正在移除隔离属性..."
    xattr -d com.apple.quarantine "$APP_PATH"
    echo "✅ 隔离属性已移除"
else
    echo "✅ 应用未被隔离"
fi

# 4. 检查权限
echo ""
echo "🔐 4. 检查应用权限..."
ls -la "$APP_PATH"

# 5. 运行应用并捕获输出
echo ""
echo "🚀 5. 启动应用并捕获日志..."
echo "=========================================="
"$APP_PATH/Contents/MacOS/$APP_NAME" 2>&1
echo "=========================================="

echo ""
echo "💡 提示：如果应用立即退出，请查看系统日志："
echo "   open -a Console"
echo "   然后在搜索框输入 '$APP_NAME' 或 'com.gaotu.$APP_NAME'"

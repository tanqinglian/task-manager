#!/bin/bash

# Task Manager 安装脚本
# 用于 macOS 系统的自动安装和配置

set -e

echo "🚀 Task Manager 安装向导"
echo "=========================="
echo ""

# 检查是否在 macOS 上运行
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ 错误：此脚本只能在 macOS 上运行"
    exit 1
fi

# 检查 DMG 文件是否存在
DMG_FILE="task-manager_0.1.0_aarch64.dmg"

if [ ! -f "$DMG_FILE" ]; then
    echo "❌ 错误：找不到 $DMG_FILE 文件"
    echo "请确保 DMG 文件和此脚本在同一个目录中"
    exit 1
fi

echo "📦 找到安装文件: $DMG_FILE"
echo ""

# 检查应用是否已安装
if [ -d "/Applications/task-manager.app" ]; then
    echo "⚠️  检测到已安装的 Task Manager"
    read -p "是否要覆盖现有安装？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 安装已取消"
        exit 0
    fi
    echo "🗑️  正在删除旧版本..."
    rm -rf /Applications/task-manager.app
fi

echo "🔨 开始安装..."
echo ""

# 创建临时挂载点
MOUNT_POINT="/Volumes/task-manager-tmp"

# 如果已经挂载，先卸载
if [ -d "$MOUNT_POINT" ]; then
    echo "🔓 卸载旧的挂载点..."
    hdiutil detach "$MOUNT_POINT" 2>/dev/null || true
fi

# 挂载 DMG
echo "💿 挂载磁盘镜像..."
hdiutil attach "$DMG_FILE" -readonly -mountpoint "$MOUNT_POINT" -noidme -nobrowse

# 复制应用到 Applications
echo "📋 复制应用到 Applications 文件夹..."
cp -R "$MOUNT_POINT/task-manager.app" /Applications/

# 卸载 DMG
echo "💿 卸载磁盘镜像..."
hdiutil detach "$MOUNT_POINT"

# 移除隔离属性
echo "🔐 配置应用权限..."
xattr -cr /Applications/task-manager.app

# 重新签名
echo "✍️  重新签名应用..."
codesign --force --deep --sign - /Applications/task-manager.app 2>/dev/null || true

echo ""
echo "✅ 安装完成！"
echo ""
echo "📝 首次打开说明："
echo "   由于 macOS 的安全机制，首次打开需要："
echo "   1. 在 Finder 中找到 Task Manager"
echo "   2. 右键点击应用"
echo "   3. 选择'打开'"
echo "   4. 在弹出的对话框中点击'打开'"
echo ""
echo "   或者在终端运行："
echo "   xattr -cr /Applications/task-manager.app"
echo ""
echo "🎉 现在可以在启动台或应用程序文件夹中找到 Task Manager"
echo ""

# 询问是否立即打开
read -p "是否现在打开 Task Manager？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open /Applications/task-manager.app
fi

echo "✨ 安装和配置完成！"

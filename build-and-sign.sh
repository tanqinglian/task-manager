#!/bin/bash
set -e

echo "🔨 开始构建 Task Manager..."

echo "📦 构建 Tauri 应用..."
pnpm tauri build

APP_PATH="src-tauri/target/release/bundle/macos/task-manager.app"
DMG_PATH="src-tauri/target/release/bundle/dmg/task-manager_0.1.0_aarch64.dmg"

echo "✅ 应用构建完成"

echo "🔐 开始签名应用..."

# 移除所有隔离属性
xattr -cr "$APP_PATH"

# 删除旧签名
codesign --remove-signature "$APP_PATH" 2>/dev/null || true

# 签名所有动态库和组件
find "$APP_PATH" -type f \( -name "*.dylib" -o -name "*.so" \) -exec codesign --force --deep --sign - {} \; 2>/dev/null || true

# 签名 Helper 应用（如果存在）
find "$APP_PATH" -name "*.app" -type d -exec codesign --force --deep --sign - {} \; 2>/dev/null || true

# 签名主应用
codesign --force --deep --sign - "$APP_PATH"

echo "🔍 验证签名..."
codesign -dv "$APP_PATH"
spctl -a -vv -t install "$APP_PATH" 2>&1 || echo "⚠️  Gatekeeper 检查警告（正常，因为是自签名）"

echo ""
echo "✅ 签名完成！"
echo "📍 应用位置: $APP_PATH"
echo "📍 DMG 位置: $DMG_PATH"
echo ""
echo "📝 给其他用户的安装说明："
echo "   1. 下载 DMG 文件"
echo "   2. 打开 DMG 并将应用拖到 Applications 文件夹"
echo "   3. 首次打开时，右键点击应用选择 '打开'"
echo "   4. 或者在终端运行: xattr -cr /Applications/task-manager.app"
echo ""

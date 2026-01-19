# Tauri 应用调试指南

## 📋 问题排查步骤

### 方法 1：使用调试脚本（推荐）

给安装了应用的人运行：

```bash
# 1. 将 debug-app.sh 发送给安装了应用的人
# 2. 在终端运行
./debug-app.sh
```

### 方法 2：查看系统日志

**MacOS 内置的日志工具：**

```bash
# 打开控制台应用
open -a Console
```

在控制台中：
1. 点击左侧的"你的电脑"
2. 在搜索框输入：`task-manager` 或 `com.gaotu.task-manager`
3. 尝试运行应用
4. 查看错误信息

**常见错误信息：**
- `Permission denied` - 权限问题
- `Library not loaded` - 依赖库缺失
- `Code signature invalid` - 签名问题

### 方法 3：终端直接运行

```bash
# 直接运行可执行文件
/Applications/task-manager.app/Contents/MacOS/task-manager
```

这样可以实时看到错误输出。

### 方法 4：检查应用隔离

macOS 可能隔离从未知开发者下载的应用：

```bash
# 检查是否被隔离
xattr -l /Applications/task-manager.app

# 如果看到 com.apple.quarantine，移除它
xattr -d com.apple.quarantine /Applications/task-manager.app

# 然后重试
open /Applications/task-manager.app
```

### 方法 5：检查文件权限

```bash
# 查看应用权限
ls -la /Applications/task-manager.app

# 确保可执行文件有执行权限
chmod +x /Applications/task-manager.app/Contents/MacOS/task-manager
```

## 🐛 常见问题

### 1. 应用闪退

**可能原因：**
- 通知插件初始化失败
- 缺少必要的系统权限
- 前端资源加载失败

**解决方法：**
```bash
# 查看详细日志
log stream --predicate 'process == "task-manager"' --level debug
```

### 2. 应用无法启动

**可能原因：**
- 代码签名问题
- 应用被 Gatekeeper 阻止

**解决方法：**
```bash
# 允许从未知开发者安装的应用
# 在"系统设置" > "隐私与安全性"中允许
```

### 3. 通知不工作

**可能原因：**
- 没有通知权限
- 通知插件初始化失败

**解决方法：**
```bash
# 在"系统设置" > "通知"中启用 task-manager 的通知
```

## 📝 给开发者：如何添加更多日志

### Rust 端日志

在 `src-tauri/src/lib.rs` 中：

```rust
use log::{info, warn, error};

info!("应用正在启动...");
warn!("这是一个警告");
error!("这是一个错误: {}", err);
```

### 前端日志

在 React 组件中：

```javascript
console.log("调试信息");
console.error("错误信息:", error);
```

这些日志可以在"开发者工具"中查看（开发模式）。

## 🔧 开发者调试模式

在开发模式下运行：

```bash
pnpm tauri dev
```

这样可以看到完整的日志输出。

## 📦 重新构建并测试

添加日志后重新构建：

```bash
# 清理旧的构建
rm -rf src-tauri/target/release/bundle

# 重新构建
pnpm tauri build

# 测试新构建的应用
open src-tauri/target/release/bundle/macos/task-manager.app
```

## 📤 给用户的信息

如果应用无法运行，请提供以下信息：

1. macOS 版本：`sw_vers`
2. 应用是否出现在 Dock 中
3. 控制台中的错误日志
4. 终端运行应用的输出

## 🚨 紧急修复

如果是通知插件导致的问题，可以临时禁用：

编辑 `src-tauri/src/lib.rs`：

```rust
// 注释掉通知插件
// .plugin(tauri_plugin_notification::init())

// 注释掉通知命令
// show_notification
```

然后重新构建。

## 📧 获取帮助

如果以上方法都无法解决问题，请提供：
1. 完整的错误日志
2. macOS 版本信息
3. 应用是否曾经运行过
4. 最近是否有系统更新

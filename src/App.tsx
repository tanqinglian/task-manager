import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { DimensionSidebar } from "./components/DimensionSidebar";
import { TaskList } from "./components/TaskList";
import { SimpleTaskList } from "./components/SimpleTaskList";
import { TaskEditor } from "./components/TaskEditor";
import { FlashNotePanel } from "./components/FlashNotes";
import { Toast } from "./components/Toast";
import { useTaskStore } from "./store/taskStore";
import { useFlashNoteStore } from "./store/flashNoteStore";
import { Task } from "./types";
import { useNotificationScheduler } from "./hooks/useNotificationScheduler";

type ViewMode = "list" | "stats";

function App() {
  const { loadTasks, getStatusStats, deleteTask } = useTaskStore();
  const { addNote } = useFlashNoteStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [isFlashNoteOpen, setIsFlashNoteOpen] = useState(false);
  const [pendingNoteContent, setPendingNoteContent] = useState<{ title: string; description: string; tags?: string[] } | undefined>(undefined);

  // Toast 状态
  const [toast, setToast] = useState<{
    message: string;
    isVisible: boolean;
  }>({
    message: '',
    isVisible: false,
  });

  // 显示 toast
  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  // 隐藏 toast
  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // 加载任务数据并请求通知权限
  useEffect(() => {
    loadTasks();

    // 请求浏览器通知权限
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("通知权限:", permission);
      });
    }
  }, [loadTasks]);

  // 启用通知调度
  useNotificationScheduler();

  const stats = getStatusStats();

  const handleNewTask = () => {
    setEditingTask(undefined);
    setIsEditorOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingTask(undefined);
  };

  const handleOpenFlashNote = () => {
    setIsFlashNoteOpen(true);
  };

  const handleCloseFlashNote = () => {
    setIsFlashNoteOpen(false);
  };

  // 从灵光一闪转化为任务
  const handleConvertNoteToTask = async (content: string, tags?: string[]) => {
    // 提取纯文本作为任务标题和描述
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const lines = textContent.split('\n').filter(line => line.trim());

    // 第一行作为标题（最多50个字符）
    const title = lines[0]?.substring(0, 50) || '从想法转化的任务';
    // 其他行作为描述
    const description = lines.length > 1 ? lines.slice(1).join('\n') : textContent;

    // 保存待填充的内容
    setPendingNoteContent({ title, description, tags });

    // 关闭灵光一闪面板
    setIsFlashNoteOpen(false);

    // 打开任务编辑器（不传 task，表示新建）
    setEditingTask(undefined);
    setIsEditorOpen(true);
  };

  // 将任务转化为灵光一闪
  const handleConvertTaskToNote = async (task: Task) => {
    // 构建笔记内容（标题+描述）
    let content = `<h2>${task.title}</h2>`;
    if (task.description) {
      content += `<p>${task.description}</p>`;
    }

    // 创建灵光一闪笔记
    addNote({
      content,
      tags: task.tags,
    });

    // 删除原任务
    await deleteTask(task.id);

    // 显示成功提示（可选）
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("💡 转换成功", {
        body: `任务"${task.title}"已转化为灵光一闪的想法`,
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 顶部导航栏 - 紧凑版 */}
      <div className="backdrop-blur-xl bg-white/70 border-b border-black/5 px-3 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          {/* 左侧：标题和视图切换 */}
          <div className="flex items-center gap-4">
            {/* 应用标题 */}
            <h1 className="text-base font-bold text-gray-900 tracking-tight">任务中心</h1>

            {/* 视图切换 */}
            <div className="flex items-center gap-1 bg-black/5 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📋 列表
              </button>
              <button
                onClick={() => setViewMode("stats")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                  viewMode === "stats"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                📊 统计
              </button>
              <button
                onClick={handleOpenFlashNote}
                className="px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow hover:from-purple-600 hover:to-pink-600"
              >
                💡 灵光一闪
              </button>
            </div>
          </div>

          {/* 右侧：操作按钮和状态统计 */}
          <div className="flex items-center gap-3">
            {/* 测试通知按钮 */}
            <button
              onClick={async () => {
                const title = "🔔 测试通知";
                const body = "通知功能正常工作！\n\n你会在工作日的上午9:20和下午6:00收到任务提醒。";
                try {
                  await invoke("show_notification", { title, body });
                } catch (error) {
                  console.error("Tauri 通知失败，使用浏览器通知:", error);
                  if ("Notification" in window && Notification.permission === "granted") {
                    new Notification(title, { body });
                  } else if ("Notification" in window) {
                    Notification.requestPermission().then((permission) => {
                      if (permission === "granted") {
                        new Notification(title, { body });
                      }
                    });
                  }
                }
              }}
              className="p-1.5 bg-white/60 backdrop-blur-sm rounded-lg border border-black/5 hover:bg-white/80 transition-all text-gray-600"
              title="测试通知"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* 新建任务按钮 */}
            <button
              onClick={handleNewTask}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow shadow-blue-500/25 transition-all duration-200 text-xs font-semibold"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              新建
            </button>

            {/* 状态统计 */}
            <div className="h-4 w-px bg-black/8"></div>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg border border-black/5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-orange-400 to-orange-500"></div>
                <span className="text-[10px] font-medium text-gray-600">规划 {stats.planning}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg border border-black/5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-500"></div>
                <span className="text-[10px] font-medium text-gray-600">进行 {stats.in_progress}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg border border-black/5 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-green-500"></div>
                <span className="text-[10px] font-medium text-gray-600">完成 {stats.completed}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden p-3">
        {viewMode === "list" ? (
          /* 列表视图：简单的倒序任务列表 */
          <SimpleTaskList
            onEditTask={handleEditTask}
            onConvertToFlashNote={handleConvertTaskToNote}
          />
        ) : (
          /* 统计视图：左侧维度 + 右侧任务列表 */
          <div className="flex gap-4 h-full">
            <DimensionSidebar />
            <TaskList onEditTask={handleEditTask} onNewTask={handleNewTask} />
          </div>
        )}
      </div>

      {/* 任务编辑器模态框 */}
      <TaskEditor
        task={editingTask}
        isOpen={isEditorOpen}
        onClose={() => {
          handleCloseEditor();
          setPendingNoteContent(undefined);
        }}
        initialContent={pendingNoteContent}
      />

      {/* 灵光一闪面板 */}
      {isFlashNoteOpen && (
        <FlashNotePanel
          onClose={handleCloseFlashNote}
          onConvertToTask={handleConvertNoteToTask}
          onNoteSaved={showToast}
        />
      )}

      {/* Toast 提示 */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onHide={hideToast}
        duration={5000}
      />
    </div>
  );
}

export default App;

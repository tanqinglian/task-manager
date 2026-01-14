import { useState } from "react";
import { useTaskStore } from "../../store/taskStore";
import { Task, TaskStatus } from "../../types";
import { STATUS_CONFIGS } from "../../constants";
import { format } from "date-fns";

interface SimpleTaskListProps {
  onEditTask: (task: Task) => void;
}

export function SimpleTaskList({ onEditTask }: SimpleTaskListProps) {
  const { tasks, deleteTask, updateTask } = useTaskStore();
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");

  // 按创建时间倒序排序
  const sortedTasks = [...tasks].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredTasks = filterStatus === "all"
    ? sortedTasks
    : sortedTasks.filter((t) => t.status === filterStatus);

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    await updateTask({ id: task.id, status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm("确定要删除这个任务吗？")) {
      await deleteTask(id);
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    const config = STATUS_CONFIGS[status];
    return (
      <span
        className="text-xs font-semibold px-3 py-1.5 rounded-full border backdrop-blur-sm"
        style={{
          color: config.color,
          backgroundColor: config.bgColor + "80",
          borderColor: config.color + "40"
        }}
      >
        {config.label}
      </span>
    );
  };

  // 移除 HTML 标签，只保留纯文本
  const stripHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="h-full backdrop-blur-xl bg-white/60 border border-black/5 rounded-2xl shadow-lg overflow-hidden flex flex-col">
      {/* 顶部工具栏 */}
      <div className="px-6 py-5 border-b border-black/5 bg-white/40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">全部任务</h1>
            <p className="text-sm text-gray-500">共 {filteredTasks.length} 个任务</p>
          </div>

          {/* 状态过滤器 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                filterStatus === "all"
                  ? "bg-gray-900 text-white shadow-lg"
                  : "bg-white/60 text-gray-600 hover:bg-white/80 border border-black/5"
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus(TaskStatus.PLANNING)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                filterStatus === TaskStatus.PLANNING
                  ? "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : "bg-white/60 text-gray-600 hover:bg-white/80 border border-black/5"
              }`}
            >
              规划中
            </button>
            <button
              onClick={() => setFilterStatus(TaskStatus.IN_PROGRESS)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                filterStatus === TaskStatus.IN_PROGRESS
                  ? "bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white/60 text-gray-600 hover:bg-white/80 border border-black/5"
              }`}
            >
              进行中
            </button>
            <button
              onClick={() => setFilterStatus(TaskStatus.COMPLETED)}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 ${
                filterStatus === TaskStatus.COMPLETED
                  ? "bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg shadow-green-500/25"
                  : "bg-white/60 text-gray-600 hover:bg-white/80 border border-black/5"
              }`}
            >
              已完成
            </button>
          </div>
        </div>
      </div>

      {/* 任务列表 */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 mb-5 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <p className="text-base font-medium text-gray-500">暂无任务</p>
            <p className="text-sm mt-2 text-gray-400">点击上方按钮创建新任务</p>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group bg-white/80 backdrop-blur-sm border border-black/5 hover:border-black/10 rounded-2xl p-5 hover:shadow-lg hover:shadow-black/5 transition-all duration-200 cursor-pointer"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: STATUS_CONFIGS[task.status].color,
                }}
                onClick={() => onEditTask(task)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 标题和状态 */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 flex-1">
                        {task.title}
                      </h3>
                      {getStatusBadge(task.status)}
                    </div>

                    {/* 描述 */}
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {stripHtml(task.description)}
                      </p>
                    )}

                    {/* 底部信息 */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        截止：{format(new Date(task.endDate), "yyyy-MM-dd")}
                      </span>

                      {/* 维度标签 */}
                      <span className="px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-lg font-medium border border-black/5">
                        {task.dimension === "week" && "📆 本周"}
                        {task.dimension === "month" && "📅 本月"}
                        {task.dimension === "quarter" && "🗓️ 本季度"}
                        {task.dimension === "half_year" && "📊 半年"}
                        {task.dimension === "year" && "📈 年度"}
                      </span>

                      {/* 标签 */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          {task.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-medium border border-blue-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 快捷操作按钮 */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task, TaskStatus.PLANNING);
                      }}
                      className="p-2.5 rounded-xl hover:bg-orange-50 text-orange-500 transition-colors"
                      title="设为规划中"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task, TaskStatus.IN_PROGRESS);
                      }}
                      className="p-2.5 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                      title="设为进行中"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(task, TaskStatus.COMPLETED);
                      }}
                      className="p-2.5 rounded-xl hover:bg-green-50 text-green-500 transition-colors"
                      title="设为已完成"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(task.id);
                      }}
                      className="p-2.5 rounded-xl hover:bg-red-50 text-red-500 transition-colors"
                      title="删除"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

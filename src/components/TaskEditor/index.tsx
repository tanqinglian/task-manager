import { useEffect, useState } from "react";
import { useTaskStore } from "../../store/taskStore";
import { Task, TaskStatus, TaskDimension, CreateTaskDTO } from "../../types";
import { DIMENSIONS, STATUS_CONFIGS } from "../../constants";
import { TiptapEditor } from "./TiptapEditor";

interface TaskEditorProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  initialContent?: {
    title: string;
    description: string;
    tags?: string[];
  };
}

export function TaskEditor({ task, isOpen, onClose, initialContent }: TaskEditorProps) {
  const { addTask, updateTask, selectedDimension } = useTaskStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.PLANNING);
  const [dimension, setDimension] = useState<TaskDimension>(selectedDimension);
  const [endDate, setEndDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setDimension(task.dimension);
      setEndDate(task.endDate);
      setTags(task.tags || []);
    } else if (initialContent) {
      // 从灵光一闪转化的预填充内容
      setTitle(initialContent.title);
      setDescription(initialContent.description);
      setStatus(TaskStatus.PLANNING);
      setDimension(selectedDimension);
      setEndDate(new Date().toISOString().split("T")[0]);
      setTags(initialContent.tags || []);
    } else {
      setTitle("");
      setDescription("");
      setStatus(TaskStatus.PLANNING);
      setDimension(selectedDimension);
      setEndDate(new Date().toISOString().split("T")[0]);
      setTags([]);
    }
  }, [task, initialContent, selectedDimension, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("请输入任务标题");
      return;
    }

    const taskData: CreateTaskDTO = {
      title: title.trim(),
      description: description.trim(),
      dimension,
      startDate: new Date().toISOString(),
      endDate,
      tags: tags.length > 0 ? tags : undefined,
    };

    if (task) {
      await updateTask({ id: task.id, ...taskData, status });
    } else {
      await addTask(taskData);
      const { tasks } = useTaskStore.getState();
      const newTask = tasks[tasks.length - 1];
      if (newTask) {
        await updateTask({ id: newTask.id, status });
      }
    }

    onClose();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl border border-black/5 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden">
        {/* macOS 风格对话框标题栏 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-base font-semibold text-gray-900">
            {task ? "编辑任务" : "新建任务"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              任务标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题..."
              className="w-full px-4 py-3 bg-white border border-black/8 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
            />
          </div>

          {/* 描述 - 富文本编辑器 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              任务描述
            </label>
            <div className="border border-black/8 rounded-xl overflow-hidden">
              <TiptapEditor content={description} onChange={setDescription} />
            </div>
          </div>

          {/* 状态和维度 */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                任务状态
              </label>
              <div className="flex gap-2">
                {Object.values(STATUS_CONFIGS).map((config) => (
                  <button
                    key={config.key}
                    onClick={() => setStatus(config.key)}
                    className={`flex-1 px-4 py-2.5 border-2 transition-all font-medium text-xs rounded-xl ${
                      status === config.key
                        ? "shadow-lg"
                        : "border-black/8 hover:border-black/12"
                    }`}
                    style={
                      status === config.key
                        ? {
                            borderColor: config.color,
                            color: config.color,
                            backgroundColor: config.bgColor,
                          }
                        : { color: "#6b7280" }
                    }
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                任务维度
              </label>
              <select
                value={dimension}
                onChange={(e) => setDimension(e.target.value as TaskDimension)}
                className="w-full px-4 py-3 bg-white border border-black/8 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              >
                {DIMENSIONS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.icon} {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 截止日期 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              截止日期 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-black/8 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
            />
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              标签
            </label>
            <div className="flex gap-3 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                placeholder="输入标签后按回车添加..."
                className="flex-1 px-4 py-3 bg-white border border-black/8 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
              />
              <button
                onClick={handleAddTag}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all text-xs shadow-lg shadow-blue-500/25"
              >
                添加
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl text-xs font-semibold border border-blue-200"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:bg-blue-200 rounded-lg p-0.5 transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 底部按钮栏 */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-black/5 bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-black/8 hover:bg-black/[0.02] rounded-xl font-semibold transition-all text-sm text-gray-700"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all text-sm shadow-lg shadow-blue-500/25"
          >
            {task ? "保存修改" : "创建任务"}
          </button>
        </div>
      </div>
    </div>
  );
}

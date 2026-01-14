import { create } from "zustand";
import { Task, TaskDimension, TaskStatus, CreateTaskDTO, UpdateTaskDTO } from "../types";
import { STORAGE_KEYS } from "../constants";

interface TaskStore {
  // 状态
  tasks: Task[];
  selectedDimension: TaskDimension;
  isReminderEnabled: boolean;

  // Actions
  setTasks: (tasks: Task[]) => void;
  setSelectedDimension: (dimension: TaskDimension) => void;
  setIsReminderEnabled: (enabled: boolean) => void;

  // 任务操作
  addTask: (task: CreateTaskDTO) => Promise<void>;
  updateTask: (task: UpdateTaskDTO) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasksByDimension: (dimension: TaskDimension) => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];

  // 统计
  getStatusStats: () => Record<TaskStatus, number>;
  loadTasks: () => Promise<void>;
  saveTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // 初始状态
  tasks: [],
  selectedDimension: TaskDimension.WEEK,
  isReminderEnabled: true,

  // Setters
  setTasks: (tasks) => set({ tasks }),
  setSelectedDimension: (dimension) => {
    set({ selectedDimension: dimension });
    localStorage.setItem(STORAGE_KEYS.SELECTED_DIMENSION, dimension);
  },
  setIsReminderEnabled: (enabled) => {
    set({ isReminderEnabled: enabled });
    localStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, String(enabled));
  },

  // 添加任务
  addTask: async (taskData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...taskData,
      status: TaskStatus.PLANNING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
    await get().saveTasks();
  },

  // 更新任务
  updateTask: async (taskData) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === taskData.id
          ? { ...task, ...taskData, updatedAt: new Date().toISOString() }
          : task
      ),
    }));
    await get().saveTasks();
  },

  // 删除任务
  deleteTask: async (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    await get().saveTasks();
  },

  // 按维度获取任务
  getTasksByDimension: (dimension) => {
    return get().tasks.filter((task) => task.dimension === dimension);
  },

  // 按状态获取任务
  getTasksByStatus: (status) => {
    return get().tasks.filter((task) => task.status === status);
  },

  // 获取状态统计
  getStatusStats: () => {
    const tasks = get().tasks;
    return {
      [TaskStatus.PLANNING]: tasks.filter((t) => t.status === TaskStatus.PLANNING).length,
      [TaskStatus.IN_PROGRESS]: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      [TaskStatus.COMPLETED]: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    };
  },

  // 从本地存储加载任务
  loadTasks: async () => {
    try {
      const storedTasks = localStorage.getItem(STORAGE_KEYS.TASKS);
      const storedDimension = localStorage.getItem(STORAGE_KEYS.SELECTED_DIMENSION);
      const storedReminder = localStorage.getItem(STORAGE_KEYS.REMINDER_ENABLED);

      if (storedTasks) {
        set({ tasks: JSON.parse(storedTasks) });
      }

      if (storedDimension) {
        set({ selectedDimension: storedDimension as TaskDimension });
      }

      if (storedReminder) {
        set({ isReminderEnabled: storedReminder === "true" });
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  },

  // 保存任务到本地存储
  saveTasks: async () => {
    try {
      const { tasks } = get();
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  },
}));

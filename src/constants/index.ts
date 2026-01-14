import { TaskDimension, TaskStatus, DimensionConfig, StatusConfig } from "../types";

/**
 * 维度配置
 */
export const DIMENSIONS: DimensionConfig[] = [
  { key: TaskDimension.WEEK, label: "本周", icon: "📆", color: "#1890FF" },
  { key: TaskDimension.MONTH, label: "本月", icon: "📅", color: "#52C41A" },
  { key: TaskDimension.QUARTER, label: "本季度", icon: "🗓️", color: "#FAAD14" },
  { key: TaskDimension.HALF_YEAR, label: "半年", icon: "📊", color: "#722ED1" },
  { key: TaskDimension.YEAR, label: "年度", icon: "📈", color: "#EB2F96" },
];

/**
 * 状态配置
 */
export const STATUS_CONFIGS: Record<TaskStatus, StatusConfig> = {
  [TaskStatus.PLANNING]: {
    key: TaskStatus.PLANNING,
    label: "规划中",
    color: "#FFA500",
    bgColor: "#FFF7E6",
  },
  [TaskStatus.IN_PROGRESS]: {
    key: TaskStatus.IN_PROGRESS,
    label: "实现中",
    color: "#1890FF",
    bgColor: "#E6F7FF",
  },
  [TaskStatus.COMPLETED]: {
    key: TaskStatus.COMPLETED,
    label: "已完成",
    color: "#52C41A",
    bgColor: "#F6FFED",
  },
};

/**
 * 提醒时间配置
 */
export const REMINDER_TIMES = {
  MORNING: "09:20",
  EVENING: "18:00",
};

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  TASKS: "task_manager_tasks",
  SELECTED_DIMENSION: "task_manager_selected_dimension",
  REMINDER_ENABLED: "task_manager_reminder_enabled",
};

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PLANNING = "planning",       // 规划中
  IN_PROGRESS = "in_progress", // 实现中
  COMPLETED = "completed"      // 已完成
}

/**
 * 任务维度枚举
 */
export enum TaskDimension {
  WEEK = "week",           // 周
  MONTH = "month",         // 月
  QUARTER = "quarter",     // 季度
  HALF_YEAR = "half_year", // 半年
  YEAR = "year"            // 年度
}

/**
 * 任务接口
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  dimension: TaskDimension;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  attachments?: string[];
}

/**
 * 创建任务DTO
 */
export interface CreateTaskDTO {
  title: string;
  description: string;
  dimension: TaskDimension;
  startDate: string;
  endDate: string;
  tags?: string[];
}

/**
 * 更新任务DTO
 */
export interface UpdateTaskDTO extends Partial<CreateTaskDTO> {
  id: string;
  status?: TaskStatus;
}

/**
 * 维度配置接口
 */
export interface DimensionConfig {
  key: TaskDimension;
  label: string;
  icon: string;
  color: string;
}

/**
 * 状态配置接口
 */
export interface StatusConfig {
  key: TaskStatus;
  label: string;
  color: string;
  bgColor: string;
}

/**
 * 灵光一闪（快速笔记）接口
 */
export interface FlashNote {
  id: string;
  content: string;           // 笔记内容（富文本）
  createdAt: string;         // 创建时间
  updatedAt: string;         // 更新时间
  tags?: string[];           // 标签
  isPinned?: boolean;        // 是否置顶
}

/**
 * 创建快速笔记DTO
 */
export interface CreateFlashNoteDTO {
  content: string;
  tags?: string[];
}

/**
 * 更新快速笔记DTO
 */
export interface UpdateFlashNoteDTO extends Partial<CreateFlashNoteDTO> {
  id: string;
  isPinned?: boolean;
}

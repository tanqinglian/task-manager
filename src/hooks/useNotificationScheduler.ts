import { useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTaskStore } from "../store/taskStore";
import { TaskStatus, Task } from "../types";
import { REMINDER_TIMES } from "../constants";

// 检查是否是工作日（周一到周五）
function isWeekday(date: Date): boolean {
  const day = date.getDay(); // 0 = 周日, 1 = 周一, ..., 6 = 周六
  return day >= 1 && day <= 5;
}

export function useNotificationScheduler() {
  const { tasks, isReminderEnabled } = useTaskStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastNotifiedDateRef = useRef<string>("");

  useEffect(() => {
    if (!isReminderEnabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // 检查并发送通知
    const checkAndSendNotification = async () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      // 只在工作日触发提醒
      if (!isWeekday(now)) {
        return;
      }

      // 只在指定时间触发通知
      if (currentTime !== REMINDER_TIMES.MORNING && currentTime !== REMINDER_TIMES.EVENING) {
        return;
      }

      // 防止重复通知（同一天同一时间只通知一次）
      const notificationKey = `${now.toDateString()}-${currentTime}`;
      if (lastNotifiedDateRef.current === notificationKey) {
        return;
      }

      // 获取需要更新的任务（规划中和进行中的任务）
      const tasksNeedingUpdate = tasks.filter(
        (task) => task.status === TaskStatus.PLANNING || task.status === TaskStatus.IN_PROGRESS
      );

      if (tasksNeedingUpdate.length === 0) {
        console.log("没有需要更新的任务");
        return;
      }

      // 构建通知内容
      const title = "🔔 任务状态更新提醒";
      const body = buildNotificationBody(tasksNeedingUpdate, currentTime);

      console.log("发送通知:", { title, body, time: currentTime });

      try {
        await invoke("show_notification", { title, body });
        lastNotifiedDateRef.current = notificationKey;
      } catch (error) {
        console.error("Failed to show notification:", error);
        // 如果是桌面环境不支持通知，使用浏览器通知作为备选
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, { body });
        } else if ("Notification" in window && Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification(title, { body });
            }
          });
        }
      }
    };

    // 立即检查一次
    checkAndSendNotification();

    // 每分钟检查一次
    intervalRef.current = setInterval(checkAndSendNotification, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [tasks, isReminderEnabled]);
}

function buildNotificationBody(tasks: Task[], currentTime: string): string {
  const timeLabel = currentTime === REMINDER_TIMES.MORNING ? "上午" : "下午";
  const taskCount = tasks.length;

  let body = `📅 ${timeLabel}好！你有 ${taskCount} 个任务需要更新状态：\n\n`;

  // 按状态分组
  const planningTasks = tasks.filter((t) => t.status === TaskStatus.PLANNING);
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);

  if (planningTasks.length > 0) {
    body += `🟠 规划中 (${planningTasks.length}个)\n`;
    planningTasks.slice(0, 5).forEach((task, index) => {
      body += `  ${index + 1}. ${task.title}\n`;
    });
    if (planningTasks.length > 5) {
      body += `  ... 还有 ${planningTasks.length - 5} 个\n`;
    }
  }

  if (inProgressTasks.length > 0) {
    body += `\n🔵 进行中 (${inProgressTasks.length}个)\n`;
    inProgressTasks.slice(0, 5).forEach((task, index) => {
      body += `  ${index + 1}. ${task.title}\n`;
    });
    if (inProgressTasks.length > 5) {
      body += `  ... 还有 ${inProgressTasks.length - 5} 个\n`;
    }
  }

  body += `\n💡 记得及时更新任务状态哦！`;

  return body;
}

"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { mockNotifications, mockTasks } from "@/lib/mock-data";
import { format } from "date-fns";

export function showTaskReminder(taskId?: string) {
  const task = taskId
    ? mockTasks.find((t) => t.id === taskId)
    : mockTasks.find((t) => t.status !== "done");

  const notification = mockNotifications[Math.floor(Math.random() * mockNotifications.length)];

  if (!task) return;

  toast(notification.message, {
    description: `📌 ${task.title} — due ${format(task.deadline, "MMM d")}`,
    duration: 6000,
  });
}

/** Drop this component on any page to show a demo notification after 3s */
export function DemoNotification() {
  useEffect(() => {
    const timer = setTimeout(() => {
      showTaskReminder();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}

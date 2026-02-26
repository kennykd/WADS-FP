"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/app/components/common/star-rating";
import { ChevronRight } from "lucide-react";
import { Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format, isPast, isToday, isTomorrow } from "date-fns";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [done, setDone] = useState(task.status === "done");

  const getDeadlineBadge = (date: Date) => {
    if (isPast(date) && !isToday(date)) return { label: "Overdue", cls: "bg-destructive/20 text-destructive border-destructive/30" };
    if (isToday(date)) return { label: "Today", cls: "bg-accent/20 text-accent border-accent/30" };
    if (isTomorrow(date)) return { label: "Tomorrow", cls: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    return { label: format(date, "MMM d"), cls: "bg-muted text-muted-foreground border-border" };
  };

  const badge = getDeadlineBadge(task.deadline);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 border-l-4 bg-card/60 backdrop-blur-sm",
        "hover:bg-card/80 transition-all duration-150 group",
        `priority-${Math.round(task.priority)}`,
        done && "opacity-60"
      )}
    >
      <Checkbox
        checked={done}
        onCheckedChange={(v) => setDone(Boolean(v))}
        className="shrink-0"
        onClick={(e) => e.stopPropagation()}
      />

      <Link href={`/tasks/${task.id}`} className="flex-1 flex items-center gap-3 min-w-0">
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm font-medium truncate",
            done && "line-through text-muted-foreground"
          )}>
            {task.title}
          </p>
          <StarRating value={task.priority} size="sm" readOnly />
        </div>

        <Badge
          className={cn("shrink-0 font-mono text-xs border", badge.cls)}
          variant="outline"
        >
          {badge.label}
        </Badge>

        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
      </Link>
    </div>
  );
}

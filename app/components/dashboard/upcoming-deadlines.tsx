import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockTasks } from "@/lib/mock-data";
import { formatDistanceToNow, isPast } from "date-fns";
import { cn } from "@/lib/utils";

export function UpcomingDeadlines() {
  const upcoming = [...mockTasks]
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 5);

  return (
    <Card className="bg-card/80 backdrop-blur-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-base font-bold tracking-wide">
          UPCOMING DEADLINES
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcoming.map((task) => {
          const overdue = isPast(task.deadline);
          const distance = formatDistanceToNow(task.deadline, { addSuffix: true });
          return (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className={cn(
                "flex items-center justify-between rounded-lg px-4 py-3 border-l-4 bg-background/40",
                "hover:bg-background/60 transition-colors",
                `priority-${Math.round(task.priority)}`
              )}
            >
              <span className="text-sm font-medium truncate flex-1 mr-3">{task.title}</span>
              <Badge
                variant={overdue ? "destructive" : "outline"}
                className="shrink-0 font-mono text-xs"
              >
                {distance}
              </Badge>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

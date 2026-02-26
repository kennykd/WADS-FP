import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

export function ActiveStudySession() {
  return (
    <Card className="bg-card/80 backdrop-blur-sm border-0">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-base font-bold tracking-wide">
          STUDY SESSION
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30">
          <Timer className="h-7 w-7 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground text-center px-2">
          No active session. Start a Pomodoro to track your focus time.
        </p>
        <Button
          asChild
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold w-full"
        >
          <Link href="/study/timer">Start Study Session</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

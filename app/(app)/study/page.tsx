"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { mockStudySessions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Bell,
  CalendarClock,
  CalendarIcon,
  Paperclip,
  Timer,
  X,
} from "lucide-react";
import {
  differenceInMinutes,
  format,
  formatDistanceToNow,
  isAfter,
  parseISO,
} from "date-fns";

type Phase = "idle" | "focus" | "break";

type StudySessionLocal = {
  id: string;
  title: string;
  notes: string;
  attachments: string[];
  scheduledAt: string;
  focusMinutes: number;
  breakMinutes: number;
  totalMinutes: number;
  status: "planned" | "in-progress" | "completed";
  createdAt: string;
};

const STORAGE_KEY = "scholarsPlot.studySessions";

const formatDuration = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

const playTone = (frequency = 880, durationMs = 220) => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioContext = new AudioContextClass();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.value = 0.08;

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + durationMs / 1000);
    oscillator.onended = () => audioContext.close();
  } catch {
    // no-op
  }
};

const seedSessions = (): StudySessionLocal[] =>
  mockStudySessions.map((session) => ({
    id: session.id,
    title: session.taskTitle ?? "Study Session",
    notes: "",
    attachments: [],
    scheduledAt: (session.scheduledAt ?? new Date()).toISOString(),
    focusMinutes: session.duration ?? 25,
    breakMinutes: session.breakDuration ?? 5,
    totalMinutes: 60,
    status: session.status === "completed" ? "completed" : "planned",
    createdAt: new Date().toISOString(),
  }));

const combineDateTime = (date: Date, time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours);
  next.setMinutes(minutes);
  next.setSeconds(0, 0);
  return next;
};

function CircularTimer({
  seconds,
  total,
  phase,
}: {
  seconds: number;
  total: number;
  phase: Phase;
}) {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? seconds / total : 0;
  const dashOffset = circumference * (1 - ratio);
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  const label =
    phase === "break" ? "BREAK" : phase === "focus" ? "FOCUS" : "READY";

  return (
    <div className="relative flex items-center justify-center">
      <svg width="220" height="220" className="-rotate-90">
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={phase === "break" ? "#3b82f6" : "var(--accent)"}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-5xl font-bold text-foreground tabular-nums">
          {mins}:{secs}
        </span>
        <span className="font-mono text-xs text-muted-foreground mt-1 tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
}

export default function StudyPage() {
  const [hydrated, setHydrated] = useState(false);
  const [sessions, setSessions] = useState<StudySessionLocal[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [phase, setPhase] = useState<Phase>("idle");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const focusModeOpenedRef = useRef(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const [autoTriggeredSessionId, setAutoTriggeredSessionId] = useState<
    string | null
  >(null);
  const [focusModeSessionId, setFocusModeSessionId] = useState<string | null>(
    null,
  );
  const [timerOnlyFocusMinutes, setTimerOnlyFocusMinutes] = useState(25);
  const [timerOnlyBreakMinutes, setTimerOnlyBreakMinutes] = useState(5);
  const [timerOnlyTotalMinutes, setTimerOnlyTotalMinutes] = useState(60);
  const [totalSecondsRemaining, setTotalSecondsRemaining] = useState(60 * 60);
  const [nowTick, setNowTick] = useState(new Date());

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [scheduledTime, setScheduledTime] = useState("");
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [totalMinutes, setTotalMinutes] = useState(60);
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setSessions(JSON.parse(stored));
      } catch {
        setSessions(seedSessions());
      }
    } else {
      setSessions(seedSessions());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [hydrated, sessions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId,
  );
  const activeSession = focusModeSessionId
    ? (sessions.find((session) => session.id === focusModeSessionId) ?? null)
    : null;
  const activeFocusMinutes = focusModeSessionId
    ? (activeSession?.focusMinutes ?? 25)
    : timerOnlyFocusMinutes;
  const activeBreakMinutes = focusModeSessionId
    ? (activeSession?.breakMinutes ?? 5)
    : timerOnlyBreakMinutes;
  const activeTotalMinutes = focusModeSessionId
    ? (activeSession?.totalMinutes ?? 60)
    : timerOnlyTotalMinutes;
  const focusSeconds = activeFocusMinutes * 60;
  const breakSeconds = activeBreakMinutes * 60;
  const totalSeconds = activeTotalMinutes * 60;
  const totalProgress =
    totalSeconds > 0
      ? ((totalSeconds - totalSecondsRemaining) / totalSeconds) * 100
      : 0;
  const totalRemainingLabel = formatDuration(
    Math.ceil(totalSecondsRemaining / 60),
  );

  useEffect(() => {
    if (!running || !showFocusMode) return;

    intervalRef.current = setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          if (phase === "focus") {
            setPhase("break");
            return breakSeconds;
          }
          if (phase === "break") {
            setPhase("focus");
            return focusSeconds;
          }
        }
        return current - 1;
      });
      setTotalSecondsRemaining((total) => Math.max(0, total - 1));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, phase, showFocusMode, breakSeconds, focusSeconds]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files.map((file) => file.name)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files ?? []);
    if (!files.length) return;
    setAttachments((prev) => [...prev, ...files.map((file) => file.name)]);
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Session title is required");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Pick a date and time for the session");
      return;
    }
    const scheduledAt = combineDateTime(scheduledDate, scheduledTime);
    const newSession: StudySessionLocal = {
      id: `session-${Date.now()}`,
      title: title.trim(),
      notes: notes.trim(),
      attachments,
      scheduledAt: scheduledAt.toISOString(),
      focusMinutes: Math.max(1, Number(focusMinutes) || 25),
      breakMinutes: Math.max(1, Number(breakMinutes) || 5),
      totalMinutes: Math.max(1, Number(totalMinutes) || 60),
      status: "planned",
      createdAt: new Date().toISOString(),
    };

    setSessions((prev) =>
      [newSession, ...prev].sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      ),
    );
    setSelectedSessionId(newSession.id);
    setTitle("");
    setNotes("");
    setAttachments([]);
    setScheduledDate(undefined);
    setScheduledTime("");
    setFocusMinutes(25);
    setBreakMinutes(5);
    setTotalMinutes(60);
    toast.success("Study session created");
  };

  const startSession = (
    sessionId?: string,
    autoStart = true,
    triggeredBySchedule = false,
  ) => {
    const id = sessionId ?? selectedSessionId;
    if (!id) return;
    const session = sessions.find((s) => s.id === id);
    if (!session) return;

    setSelectedSessionId(id);
    setFocusModeSessionId(id);
    setAutoTriggeredSessionId(triggeredBySchedule ? id : null);
    setShowFocusMode(true);
    setPhase("focus");
    setSeconds(session.focusMinutes * 60);
    setTotalSecondsRemaining(session.totalMinutes * 60);
    setRunning(autoStart);
    setSessions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "in-progress" } : item,
      ),
    );
  };

  const startTimerOnly = () => {
    setFocusModeSessionId(null);
    setAutoTriggeredSessionId(null);
    setShowFocusMode(true);
    setPhase("focus");
    setSeconds(timerOnlyFocusMinutes * 60);
    setTotalSecondsRemaining(timerOnlyTotalMinutes * 60);
    setRunning(true);
  };

  const exitFocusMode = () => {
    setRunning(false);
    setPhase("idle");
    setShowFocusMode(false);
    setFocusModeSessionId(null);
    setAutoTriggeredSessionId(null);
    setAutoTriggeredSessionId(null);
  };

  useEffect(() => {
    if (showFocusMode) return;
    const dueSession = sessions
      .filter(
        (session) =>
          session.status === "planned" &&
          new Date(session.scheduledAt).getTime() <= nowTick.getTime(),
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
      )[0];

    if (dueSession) {
      toast.info(`Study session starting now: ${dueSession.title}`);
      startSession(dueSession.id, true, true);
    }
  }, [sessions, nowTick, showFocusMode]);

  useEffect(() => {
    if (showFocusMode && !focusModeOpenedRef.current) {
      playTone(880, 220);
      if (!autoTriggeredSessionId) {
        toast.info("Focus mode started");
      }
      focusModeOpenedRef.current = true;
    }
    if (!showFocusMode) {
      focusModeOpenedRef.current = false;
    }
  }, [showFocusMode, autoTriggeredSessionId]);

  const snoozeSession = (minutes = 10) => {
    if (!activeSession) return;
    const snoozeUntil = new Date();
    snoozeUntil.setMinutes(snoozeUntil.getMinutes() + minutes);
    setSessions((prev) =>
      prev.map((item) =>
        item.id === activeSession.id
          ? {
              ...item,
              scheduledAt: snoozeUntil.toISOString(),
              status: "planned",
            }
          : item,
      ),
    );
    setAutoTriggeredSessionId(null);
    toast.info(`Snoozed "${activeSession.title}" for ${minutes} minutes`);
    exitFocusMode();
  };

  const pauseSession = () => {
    if (phase === "idle") return;
    setRunning((prev) => !prev);
  };

  const resetSession = () => {
    if (!showFocusMode) return;
    setRunning(false);
    setSeconds(phase === "break" ? breakSeconds : focusSeconds);
    setTotalSecondsRemaining(totalSeconds);
  };

  const markCompleted = () => {
    if (!activeSession) return;
    setSessions((prev) =>
      prev.map((item) =>
        item.id === activeSession.id ? { ...item, status: "completed" } : item,
      ),
    );
    setRunning(false);
    setPhase("idle");
    setShowFocusMode(false);
    setFocusModeSessionId(null);
  };

  useEffect(() => {
    if (!showFocusMode || totalSecondsRemaining > 0) return;
    playTone(520, 300);
    if (activeSession) {
      toast.success(`Session complete: ${activeSession.title}`);
      markCompleted();
      return;
    }
    toast.success("Timer complete");
    exitFocusMode();
  }, [showFocusMode, totalSecondsRemaining, activeSession]);

  const now = nowTick;
  const upcomingSessions = sessions
    .filter(
      (session) =>
        session.status !== "completed" &&
        isAfter(parseISO(session.scheduledAt), now),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    );

  const upcomingSoon = upcomingSessions.filter((session) => {
    const minutesAway = differenceInMinutes(parseISO(session.scheduledAt), now);
    return minutesAway >= 0 && minutesAway <= 60;
  });

  return (
    <>
      {showFocusMode && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
          <div className="flex h-full w-full flex-col gap-6 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-xs text-muted-foreground tracking-widest">
                  FOCUS MODE
                </p>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {activeSession?.title ?? "Timer Only"}
                </h2>
                {activeSession && (
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(activeSession.scheduledAt), "PPP p")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <Badge variant="outline" className="font-mono text-[10px]">
                  {activeFocusMinutes}m / {activeBreakMinutes}m
                </Badge>
                <Badge variant="secondary" className="text-[10px]">
                  Total {formatDuration(activeTotalMinutes)}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exitFocusMode}
                  className="font-mono text-xs"
                >
                  Back to Planner
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="flex flex-col items-center gap-6 py-8">
                  <CircularTimer
                    seconds={seconds}
                    total={phase === "break" ? breakSeconds : focusSeconds}
                    phase={phase}
                  />
                  <div className="w-full max-w-xs space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Total remaining</span>
                      <span className="font-mono">{totalRemainingLabel}</span>
                    </div>
                    <Progress value={totalProgress} />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                      onClick={pauseSession}
                      className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8"
                    >
                      {running ? "Pause" : "Resume"}
                    </Button>
                    <Button variant="outline" onClick={resetSession}>
                      Reset
                    </Button>
                    {activeSession ? (
                      <>
                        {autoTriggeredSessionId === activeSession.id && (
                          <Button
                            variant="outline"
                            onClick={() => snoozeSession(10)}
                            className="font-mono text-xs"
                          >
                            Snooze 10m
                          </Button>
                        )}
                        <Button variant="ghost" onClick={markCompleted}>
                          Mark Done
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" onClick={exitFocusMode}>
                        End Timer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {activeSession ? (
                  <>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-base font-bold tracking-wide">
                          NOTES
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {activeSession.notes ? (
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {activeSession.notes}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No notes for this session.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="font-display text-base font-bold tracking-wide">
                          ATTACHMENTS
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {activeSession.attachments.length ? (
                          activeSession.attachments.map((file, index) => (
                            <div
                              key={`${file}-${index}`}
                              className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/30 px-3 py-2 text-xs"
                            >
                              <Paperclip className="h-3 w-3 text-muted-foreground" />
                              <span className="truncate">{file}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No attachments added.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="font-display text-base font-bold tracking-wide">
                        TIMER ONLY
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        You are running a quick focus timer. Create a study
                        session to add notes, attachments, and reminders.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="p-6 space-y-6">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
            STUDY SESSIONS
          </h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-widest">
            PLAN · SCHEDULE · FOCUS
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="border-t-2 border-accent rounded-t-xl pb-2">
                <CardTitle className="font-display text-lg">
                  Create Study Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateSession} className="space-y-5 pt-2">
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs tracking-wider">
                      TITLE
                    </Label>
                    <Input
                      placeholder="e.g. Biology Chapter 6 Review"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs tracking-wider">
                        SCHEDULE DATE
                      </Label>
                      <Popover open={calOpen} onOpenChange={setCalOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !scheduledDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate
                              ? format(scheduledDate, "PPP")
                              : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={scheduledDate}
                            onSelect={(value) => {
                              setScheduledDate(value);
                              setCalOpen(false);
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs tracking-wider">
                        TIME
                      </Label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs tracking-wider">
                        FOCUS MINUTES
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={focusMinutes}
                        onChange={(e) =>
                          setFocusMinutes(Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-mono text-xs tracking-wider">
                        BREAK MINUTES
                      </Label>
                      <Input
                        type="number"
                        min={1}
                        value={breakMinutes}
                        onChange={(e) =>
                          setBreakMinutes(Number(e.target.value))
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground md:col-span-2">
                      Defaults are 25 minutes focus and 5 minutes break.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono text-xs tracking-wider">
                      TOTAL DURATION (MINUTES)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={totalMinutes}
                      onChange={(e) => setTotalMinutes(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Total: {formatDuration(totalMinutes)}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs tracking-wider">
                      NOTES
                    </Label>
                    <Textarea
                      placeholder="Add goals or notes for this session..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="resize-y min-h-[90px]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs tracking-wider">
                      ATTACHMENTS
                    </Label>
                    {attachments.length ? (
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div
                            key={`${file}-${index}`}
                            className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                          >
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm flex-1 truncate">
                              {file}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setAttachments((prev) =>
                                  prev.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <label
                        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/50 bg-muted/20 px-4 py-6 cursor-pointer hover:border-accent/50 transition-colors"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                      >
                        <Paperclip className="h-6 w-6 text-muted-foreground" />
                        <span className="font-mono text-xs text-muted-foreground">
                          Drop files here or click to browse
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleFileSelect}
                        />
                      </label>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                    >
                      Create Session
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/calendar">
                        <CalendarClock className="h-4 w-4 mr-2" /> Calendar
                      </Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base font-bold tracking-wide">
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No upcoming sessions. Schedule one to get started.
                  </p>
                ) : (
                  upcomingSessions.slice(0, 6).map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-col gap-3 rounded-lg border border-border/40 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(session.scheduledAt), "PPP p")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-[10px]"
                          >
                            {session.focusMinutes}m / {session.breakMinutes}m
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            Total {formatDuration(session.totalMinutes)}
                          </Badge>
                          {session.attachments.length > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              {session.attachments.length} attachment
                              {session.attachments.length > 1 ? "s" : ""}
                            </Badge>
                          )}
                          {session.notes && (
                            <Badge variant="secondary" className="text-[10px]">
                              Notes
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => startSession(session.id)}
                          className="bg-accent hover:bg-accent/90 text-accent-foreground"
                        >
                          Start
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedSessionId(session.id)}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base font-bold tracking-wide">
                  Timer Only
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Start a quick focus timer without scheduling a session.
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs tracking-wider">
                      FOCUS MINUTES
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={timerOnlyFocusMinutes}
                      onChange={(e) =>
                        setTimerOnlyFocusMinutes(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-xs tracking-wider">
                      BREAK MINUTES
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={timerOnlyBreakMinutes}
                      onChange={(e) =>
                        setTimerOnlyBreakMinutes(Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs tracking-wider">
                    TOTAL DURATION (MINUTES)
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={timerOnlyTotalMinutes}
                    onChange={(e) =>
                      setTimerOnlyTotalMinutes(Number(e.target.value))
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Total: {formatDuration(timerOnlyTotalMinutes)}
                  </p>
                </div>
                <Button
                  onClick={startTimerOnly}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  Start Timer
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-base font-bold tracking-wide flex items-center gap-2">
                  <Bell className="h-4 w-4 text-accent" />
                  Upcoming Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingSoon.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No study sessions starting within the next hour.
                  </p>
                ) : (
                  upcomingSoon.map((session) => (
                    <div
                      key={session.id}
                      className="rounded-lg border border-accent/20 bg-accent/10 px-4 py-3"
                    >
                      <p className="font-medium text-foreground">
                        {session.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Starts{" "}
                        {formatDistanceToNow(parseISO(session.scheduledAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

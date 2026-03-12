"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const MOCK_RESPONSES = [
  "I'd suggest breaking that task into smaller 25-minute Pomodoro blocks to stay focused!",
  "Based on productivity research, evenings or mornings work best for deep work. Try scheduling complex tasks then.",
  "Don't forget to take short breaks every 25 minutes — it significantly boosts retention.",
  "You could prioritize tasks with the nearest deadlines first. Want help sorting them by urgency?",
  "For collaborative projects, assigning clear ownership to each task reduces blockers and confusion.",
  "Try the Feynman technique: explain what you're studying in simple terms to solidify understanding.",
  "Spaced repetition is one of the most effective study strategies. Revisit material 1 day, 3 days, and 1 week later.",
  "Make sure your study sessions have a clear goal — e.g. 'complete 10 practice problems' rather than 'study for 2 hours'.",
];

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hi! I'm your Scholar's Plot AI assistant. Ask me anything about your tasks, study sessions, or projects!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    await new Promise((res) => setTimeout(res, 900 + Math.random() * 700));

    const response =
      MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    const assistantMsg: Message = {
      id: `a-${Date.now()}`,
      role: "assistant",
      content: response,
    };
    setMessages((prev) => [...prev, assistantMsg]);
    setLoading(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-[4.5rem] right-4 z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/95 shadow-2xl backdrop-blur-sm sm:bottom-20 sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-accent" />
              <span className="font-display text-sm font-bold tracking-wide">
                AI ASSISTANT
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div
            className="space-y-3 overflow-y-auto px-4 py-3"
            style={{ maxHeight: "280px" }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted/60 text-foreground",
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-muted/60 px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border/40 px-4 py-3">
            <Input
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="h-9 text-sm"
            />
            <Button
              size="icon"
              className="h-9 w-9 bg-accent hover:bg-accent/90 text-accent-foreground"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-[4.5rem] right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all sm:bottom-6 sm:right-6",
          open
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-accent text-accent-foreground hover:bg-accent/90",
        )}
        aria-label="Open AI assistant"
      >
        <Bot className="h-5 w-5" />
      </button>
    </>
  );
}

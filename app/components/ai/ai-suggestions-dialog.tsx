"use client";

import { useState } from "react";
import { Sparkles, Loader2, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Suggestion = {
  id: string;
  title: string;
  description: string;
};

export type AISuggestionsContext = "tasks" | "projects" | "study";

type AISuggestionsDialogProps = {
  context: AISuggestionsContext;
  onAdd?: (suggestion: Suggestion) => void;
};

const SUGGESTIONS: Record<AISuggestionsContext, Suggestion[]> = {
  tasks: [
    {
      id: "t1",
      title: "Review lecture notes",
      description:
        "Go through notes from the last 3 lectures and highlight key concepts.",
    },
    {
      id: "t2",
      title: "Complete practice problems",
      description:
        "Solve at least 10 practice problems from your current chapter before the exam.",
    },
    {
      id: "t3",
      title: "Form a study group",
      description:
        "Coordinate with classmates for a group review session this weekend.",
    },
    {
      id: "t4",
      title: "Draft essay outline",
      description:
        "Create a detailed outline for the upcoming research paper submission.",
    },
  ],
  projects: [
    {
      id: "p1",
      title: "Define project milestones",
      description:
        "Break the project into 3–4 clear milestones with individual deadlines.",
    },
    {
      id: "p2",
      title: "Set up shared notes doc",
      description:
        "Create a shared document for meeting notes, decisions, and references.",
    },
    {
      id: "p3",
      title: "Assign roles for presentation",
      description:
        "Divide presentation sections among team members based on strengths.",
    },
    {
      id: "p4",
      title: "Schedule weekly check-ins",
      description:
        "Agree on a recurring team sync to unblock each other and review progress.",
    },
  ],
  study: [
    {
      id: "s1",
      title: "Pomodoro block for deep work",
      description:
        "4 × 25-minute focus sessions with 5-minute breaks — ideal for complex material.",
    },
    {
      id: "s2",
      title: "Active recall session",
      description:
        "Close your notes and write down everything you remember from last week's material.",
    },
    {
      id: "s3",
      title: "Spaced repetition review",
      description:
        "Revisit flashcards or notes from 3 days ago to reinforce memory retention.",
    },
    {
      id: "s4",
      title: "Pre-exam mock test",
      description:
        "Simulate exam conditions for 60 minutes using past papers or practice sets.",
    },
  ],
};

const CONTEXT_META: Record<
  AISuggestionsContext,
  { label: string; description: string }
> = {
  tasks: {
    label: "Task Suggestions",
    description: "AI-generated tasks to help you stay on track.",
  },
  projects: {
    label: "Project Task Ideas",
    description: "Suggested tasks to move your project forward.",
  },
  study: {
    label: "Study Session Ideas",
    description: "Recommended sessions based on proven study techniques.",
  },
};

export function AISuggestionsDialog({
  context,
  onAdd,
}: AISuggestionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && suggestions.length === 0) {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 900 + Math.random() * 600));
      setSuggestions(SUGGESTIONS[context]);
      setLoading(false);
    }
  };

  const handleAdd = (suggestion: Suggestion) => {
    setAdded((prev) => new Set(prev).add(suggestion.id));
    onAdd?.(suggestion);
    toast.success(`"${suggestion.title}" added!`);
  };

  const { label, description } = CONTEXT_META[context];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-1.5 font-mono text-xs border-accent/40 text-accent hover:bg-accent/10 hover:text-accent"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Suggestions
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display tracking-wide flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            {label}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            <p className="font-mono text-xs">Generating suggestions...</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {suggestions.map((suggestion) => {
              const isAdded = added.has(suggestion.id);
              return (
                <div
                  key={suggestion.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border/40 bg-muted/20 px-4 py-3"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {suggestion.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isAdded ? "outline" : "default"}
                    className={cn(
                      "shrink-0 text-xs",
                      !isAdded &&
                        "bg-accent hover:bg-accent/90 text-accent-foreground",
                    )}
                    disabled={isAdded}
                    onClick={() => handleAdd(suggestion)}
                  >
                    {isAdded ? (
                      <>
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Added
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

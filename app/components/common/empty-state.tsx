import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/20 bg-muted/10">
        <Icon className="h-7 w-7 text-muted-foreground/40" />
      </div>
      <div className="space-y-1">
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      </div>
      {action && (
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

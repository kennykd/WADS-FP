"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

// This function is to the be placed into the settings page
// So that the settings page can mostly run on the server side
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">Theme</p>
        <p className="font-mono text-xs text-muted-foreground">
          {mounted && isDark ? "Blueprint (Dark)" : "Light Mode"}
        </p>
      </div>
      <Toggle
        pressed={mounted ? isDark : false}
        onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
        aria-label="Toggle dark mode"
        className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
      >
        {mounted && isDark ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Toggle>
    </div>
  );
}

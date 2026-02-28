"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toggle } from "@/components/ui/toggle";
import LogoutButton from "@/app/components/auth/logout-button";
import { Moon, Sun } from "lucide-react";

interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/users/me", { method: "GET" });
        if (!response.ok) return;
        const data = (await response.json()) as CurrentUser;
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const displayName = isLoading ? "" : (user?.name ?? user?.email ?? "User");
  const avatarSrc = user?.image?.trim() || undefined;
  const initials = isLoading
    ? ""
    : (displayName ?? "U")
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          SETTINGS
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-1 tracking-widest">
          PREFERENCES & PROFILE
        </p>
      </div>

      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4 pt-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={avatarSrc} alt={displayName ?? ""} />
            <AvatarFallback className="bg-accent text-accent-foreground text-lg font-bold">
              {isLoading ? "..." : initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display text-lg font-bold text-foreground">
              {isLoading ? "Loading profile..." : displayName}
            </p>
            <p className="font-mono text-xs text-muted-foreground">
              {isLoading ? "" : (user?.email ?? "")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg">Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-4">
          <div>
            <p className="text-sm font-medium">Theme</p>
            <p className="font-mono text-xs text-muted-foreground">
              {isDark ? "Blueprint (Dark)" : "Light Mode"}
            </p>
          </div>
          <Toggle
            pressed={isDark}
            onPressedChange={(v) => setTheme(v ? "dark" : "light")}
            aria-label="Toggle dark mode"
            className="data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            {isDark ? (
              <Moon className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </Toggle>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <LogoutButton />
      </div>
    </div>
  );
}

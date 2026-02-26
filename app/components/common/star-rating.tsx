"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export function StarRating({ value, onChange, size = "md", readOnly = false }: StarRatingProps) {
  const starSize = sizeMap[size];

  const handleClick = (starIndex: number, isRightHalf: boolean) => {
    if (readOnly || !onChange) return;
    const newValue = isRightHalf ? starIndex + 1 : starIndex + 0.5;
    onChange(newValue);
  };

  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`Rating: ${value} out of 5`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = value >= i + 1;
        const halfFilled = !filled && value >= i + 0.5;

        return (
          <span
            key={i}
            className={cn("relative inline-flex", !readOnly && "cursor-pointer")}
            onClick={(e) => {
              if (readOnly) return;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const isRightHalf = e.clientX - rect.left > rect.width / 2;
              handleClick(i, isRightHalf);
            }}
          >
            {/* Background (empty) star */}
            <Star
              className={cn(starSize, "text-muted-foreground/30")}
              fill="currentColor"
            />
            {/* Filled overlay */}
            {(filled || halfFilled) && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: filled ? "100%" : "50%" }}
              >
                <Star
                  className={cn(starSize, "text-accent")}
                  fill="currentColor"
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

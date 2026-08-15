"use client";

import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md";
}

export function StarRating({ value, onChange, size = "md" }: Props) {
  const iconSize = size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            className={`${iconSize} ${
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

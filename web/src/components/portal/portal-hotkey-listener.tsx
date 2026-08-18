"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function PortalHotkeyListener() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        const target = e.target as HTMLElement | null;
        if (target) {
          const tagName = target.tagName ? target.tagName.toUpperCase() : "";
          const isEditable =
            target.isContentEditable ||
            tagName === "INPUT" ||
            tagName === "TEXTAREA" ||
            tagName === "SELECT";
          
          if (isEditable) {
            return;
          }
        }

        e.preventDefault();
        router.push("/portal/login");
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [router]);

  return null;
}

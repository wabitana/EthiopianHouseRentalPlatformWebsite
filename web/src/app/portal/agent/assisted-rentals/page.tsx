"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AssistedRentalsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal/agent");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-xs">
      Redirecting to Agent Portal...
    </div>
  );
}

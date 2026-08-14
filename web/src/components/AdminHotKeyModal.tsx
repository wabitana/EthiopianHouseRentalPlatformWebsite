"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Copy,
  Check,
  X,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function AdminHotKeyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedAdmin, setCopiedAdmin] = useState(false);
  const [copiedSubAdmin, setCopiedSubAdmin] = useState(false);
  const router = useRouter();

  // Listen for Ctrl + Shift + A (or Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const copyToClipboard = (text: string, type: "admin" | "subadmin") => {
    navigator.clipboard.writeText(text);
    if (type === "admin") {
      setCopiedAdmin(true);
      setTimeout(() => setCopiedAdmin(false), 2000);
    } else {
      setCopiedSubAdmin(true);
      setTimeout(() => setCopiedSubAdmin(false), 2000);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 z-40 text-[10px] text-slate-400 hover:text-emerald-400 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-full border border-slate-700/60 shadow-lg flex items-center gap-1.5 transition-all opacity-60 hover:opacity-100"
        title="Click or press Ctrl + Shift + A to open Admin Access Portal"
      >
        <Lock className="w-3 h-3 text-emerald-400" />
        <span>Press <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white font-mono">Ctrl+Shift+A</kbd> for Admin</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 text-white shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Key className="w-3.5 h-3.5" /> Secret Access Portal (Ctrl + Shift + A)
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Admin & Sub-Admin Access Credentials
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Below are the pre-configured administrator accounts for managing the Ethiopian House Rental Platform.
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Super Admin Box */}
          <div className="bg-slate-800/90 border border-purple-500/30 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-3">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span>👑 Super Admin Portal</span>
              </div>

              <div className="space-y-2 text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono mb-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Email:</span>
                  <span className="text-emerald-300 font-bold">admin@delala.com</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Password:</span>
                  <span className="text-amber-300 font-bold">password123</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Role / Scope:</span>
                  <span className="text-purple-300">ADMIN (Global Platform & Escrow)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => copyToClipboard("Email: admin@delala.com\nPassword: password123", "admin")}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors"
              >
                {copiedAdmin ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Credentials!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Admin Info
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/cms/dashboard");
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 transition-all"
              >
                Enter Super Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Sub Admin Box */}
          <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>🛡️ Sub-Admin Portal</span>
              </div>

              <div className="space-y-2 text-xs bg-slate-950/80 p-3 rounded-lg border border-slate-800 font-mono mb-4">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Email:</span>
                  <span className="text-emerald-300 font-bold">subadmin@delala.com</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Password:</span>
                  <span className="text-amber-300 font-bold">password123</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">Assigned Region:</span>
                  <span className="text-amber-300">Addis Ababa - Bole & Kazanchis</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => copyToClipboard("Email: subadmin@delala.com\nPassword: password123", "subadmin")}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition-colors"
              >
                {copiedSubAdmin ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Credentials!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Sub-Admin Info
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/sub-admin");
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-900/30 transition-all"
              >
                Enter Sub-Admin Desk <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800 pt-4">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> You can open this portal anytime by pressing <kbd className="bg-slate-800 px-1 py-0.5 rounded text-white font-mono">Ctrl+Shift+A</kbd>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white underline font-medium"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertTriangle,
  Loader2,
} from "lucide-react";

export default function PortalLoginPage() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI status states
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<"none" | "invalid">("none");
  const [errorText, setErrorText] = useState<string>("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorState("none");
    setErrorText("");
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
      const response = await fetch(`${backendUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const resData = await response.json().catch(() => ({}));
        let message = "Invalid email address or password. Please check your credentials.";
        if (
          typeof resData.error === "string" &&
          !resData.error.includes("Error") &&
          !resData.error.includes("prisma") &&
          !resData.error.includes("SELECT") &&
          !resData.error.includes("at ")
        ) {
          message = resData.error;
        }
        setErrorText(message);
        setErrorState("invalid");
        return;
      }

      const data = await response.json();
      const token = data.token;

      // Store access token in a JS-readable cookie
      document.cookie = `delala_token=${token}; path=/; max-age=${60 * 60}; SameSite=Lax`;

      const userRole = (data.user?.role || "").toLowerCase();
      if (userRole === "admin") {
        router.push("/portal/admin");
      } else if (userRole === "agent") {
        router.push("/portal/agent");
      } else {
        // Reject seekers/providers trying to access staff portal
        document.cookie = "delala_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        setErrorText("Access Denied: Authorized staff and agents only.");
        setErrorState("invalid");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorText("Unable to connect to authentication server. Please try again.");
      setErrorState("invalid");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-400" />
          Back to Public Website
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20 mb-3">
            <Home className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Ethiopian House Rental Portal
          </h2>
        </div>

        {/* Secure Login Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Error Banner */}
          {errorState === "invalid" && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-3 text-rose-300 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                <span>{errorText}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorState("none")}
                className="text-rose-400 hover:text-rose-200 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorState !== "none") setErrorState("none");
                  }}
                  placeholder="enter Email"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorState !== "none") setErrorState("none");
                  }}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>Log In to Portal</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

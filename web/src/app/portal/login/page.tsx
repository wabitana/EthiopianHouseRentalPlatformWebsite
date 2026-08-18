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
  ShieldCheck,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  HelpCircle,
  UserCheck,
  Building2,
} from "lucide-react";

export default function PortalLoginPage() {
  const router = useRouter();

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"admin" | "agent" | "auto">("auto");

  // Interactive UI states for simulation
  const [isLoading, setIsLoading] = useState(false);
  const [errorState, setErrorState] = useState<"none" | "invalid" | "locked">("none");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Quick fill mock credentials handler
  const handleQuickFill = (targetRole: "admin" | "agent") => {
    setErrorState("none");
    if (targetRole === "admin") {
      setEmail("admin@example.com");
      setPassword("admin123456");
      setRole("admin");
    } else {
      setEmail("agent@example.com");
      setPassword("agent123456");
      setRole("agent");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (errorState !== "none") {
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail.includes("agent") || role === "agent") {
        router.push("/portal/agent");
      } else {
        router.push("/portal/admin");
      }
    }, 900);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Back to Website Button */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 transition-all shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 text-emerald-400" />
          Back to Public Website
        </Link>
        
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 px-3 py-1.5 rounded-full border border-slate-700/60">
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-200 font-mono text-[10px]">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-200 font-mono text-[10px]">Shift</kbd>
          <span>+</span>
          <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-200 font-mono text-[10px]">A</kbd>
          <span className="text-slate-500 ml-1">Portal Shortcut</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Brand Logo & Title Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-4 ring-emerald-500/20 mb-4">
            <Home className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Ethiopian House Rental
          </h2>
          <p className="mt-1 text-sm text-emerald-400 font-semibold tracking-wide uppercase">
            Internal Portal Login
          </p>
          <p className="mt-2 text-xs text-slate-400 max-w-xs">
            Secure administrative workspace for platform managers & real-estate agents.
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
          {/* Simulation Controls Banner */}
          <div className="mb-6 p-3 bg-slate-900/80 rounded-xl border border-slate-700 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Demo Login Credentials:
              </span>
              <span className="text-[10px] text-slate-400">Click to autofill</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleQuickFill("admin")}
                className={`py-1.5 px-2.5 rounded-lg border text-left font-mono transition-all flex items-center justify-between ${
                  email === "admin@example.com"
                    ? "bg-emerald-950/70 border-emerald-500 text-emerald-300"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                <span>admin@example.com</span>
                <span className="text-[9px] uppercase px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded font-sans font-bold">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill("agent")}
                className={`py-1.5 px-2.5 rounded-lg border text-left font-mono transition-all flex items-center justify-between ${
                  email === "agent@example.com"
                    ? "bg-blue-950/70 border-blue-500 text-blue-300"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                <span>agent@example.com</span>
                <span className="text-[9px] uppercase px-1 py-0.2 bg-blue-500/20 text-blue-400 rounded font-sans font-bold">Agent</span>
              </button>
            </div>
          </div>

          {/* Interactive Error State Banner */}
          {errorState === "invalid" && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs animate-shake">
              <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-rose-200">Invalid Credentials</p>
                <p className="mt-0.5">The email or password you entered is incorrect. Please check your credentials or reset password.</p>
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

          {errorState === "locked" && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs">
              <Lock className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-200">Account Locked</p>
                <p className="mt-0.5">Too many failed login attempts. Account access is temporarily locked for security. Contact admin@delala.et.</p>
              </div>
              <button
                type="button"
                onClick={() => setErrorState("none")}
                className="text-amber-400 hover:text-amber-200 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email / Username
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
                  placeholder="admin@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>
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
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
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

            {/* Role Selection Option */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Target Role Portal
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("auto")}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    role === "auto"
                      ? "bg-slate-700 border-slate-500 text-white shadow-sm"
                      : "bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Auto Detect
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    role === "admin"
                      ? "bg-emerald-600/30 border-emerald-500 text-emerald-300 font-semibold shadow-sm"
                      : "bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole("agent")}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                    role === "agent"
                      ? "bg-blue-600/30 border-blue-500 text-blue-300 font-semibold shadow-sm"
                      : "bg-slate-900/50 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Agent
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                Remember me on this workstation
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Log In to {role === "agent" ? "Agent Portal" : role === "admin" ? "Admin Portal" : "Portal"}
                </>
              )}
            </button>
          </form>

          {/* Interactive State Demo Switches */}
          <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Test Error States:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setErrorState("invalid")}
                className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 text-rose-300 rounded border border-rose-500/30"
              >
                Invalid Credentials
              </button>
              <button
                type="button"
                onClick={() => setErrorState("locked")}
                className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 text-amber-300 rounded border border-amber-500/30"
              >
                Account Locked
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Note */}
        <p className="mt-6 text-center text-xs text-slate-500">
          Ethiopian House Rental Platform • Authorised Staff & Agent Portal Access Only
        </p>
      </div>

      {/* Forgot Password Modal UI */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setForgotSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            {!forgotSubmitted ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                    <HelpCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Reset Staff Password</h3>
                    <p className="text-xs text-slate-400">Enter your internal email address to receive a password reset link.</p>
                  </div>
                </div>

                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="admin@delala.et"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md"
                    >
                      Send Reset Instructions
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Instructions Sent!</h3>
                <p className="text-xs text-slate-300">
                  Password reset link has been dispatched to <span className="text-emerald-400 font-semibold">{forgotEmail}</span>. Check your inbox.
                </p>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotSubmitted(false);
                  }}
                  className="mt-4 px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

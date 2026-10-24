import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  BrainCircuit,
  Loader2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Cpu,
  Network,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Invalid credentials. Please verify email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100">
      {/* ---------------- Left Hero Branding Panel (Desktop) ---------------- */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-12 lg:flex">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-violet-600/15 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            <BrainCircuit className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-lg">MemoraAI</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/30">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-xs text-slate-400">Cognitive Organizational Memory Engine</p>
          </div>
        </div>

        {/* Center Feature Highlights */}
        <div className="relative z-10 my-auto max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur-sm">
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            Empowering Next-Gen AI Workspaces
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Unified Knowledge Graph & <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Hybrid Neural Retrieval
            </span>
          </h2>

          <p className="text-sm leading-relaxed text-slate-400">
            Connect codebases, repositories, documentation, and enterprise communication into a living,
            queryable knowledge graph powered by AST CodeMind and vector semantics.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <Cpu className="mt-0.5 h-5 w-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">CodeMind AST</p>
                <p className="text-[11px] text-slate-400">Granular call-graph analysis</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 backdrop-blur-sm">
              <Network className="mt-0.5 h-5 w-5 text-violet-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-slate-200">Neo4j + Qdrant</p>
                <p className="text-[11px] text-slate-400">Hybrid graph & vector store</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
            <span className="text-slate-400">Enterprise Engine Active</span>
          </div>
          <span>Hacktoberfest Edition</span>
        </div>
      </div>

      {/* ---------------- Right Auth Form Container ---------------- */}
      <div className="flex flex-1 flex-col items-center justify-center bg-slate-950 px-6 py-12 lg:px-16">
        <div className="w-full max-w-md">
          {/* Mobile Logo Fallback */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500">
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-base">MemoraAI</span>
              <p className="text-xs text-slate-400">Enterprise Memory Engine</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Sign In</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Access your organizational memory workspace and AI tools.
            </p>
          </div>

          {/* Judge Demo Quick Access Pill Box */}
          <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-950/20 p-3.5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                <Zap size={14} className="text-amber-400 fill-amber-400" />
                1-Click Demo Credentials
              </span>
              <span className="text-[10px] text-slate-400">For Reviewers & Judges</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill("admin@technova.com", "Admin@123")}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-indigo-500 hover:bg-slate-800 hover:text-white"
              >
                <ShieldCheck size={14} className="text-indigo-400" />
                Admin Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("employee@technova.com", "Employee@123")}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-900/80 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-violet-500 hover:bg-slate-800 hover:text-white"
              >
                <CheckCircle2 size={14} className="text-violet-400" />
                Employee Demo
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Work Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@technova.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign in to Workspace</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Need an organizational workspace?{" "}
            <Link
              to="/register"
              className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
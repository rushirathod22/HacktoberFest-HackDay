import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BrainCircuit,
  Loader2,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { registerUser } from "../../services/api/auth";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser({
        name,
        email,
        password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: "Registration successful. Please sign in with your credentials.",
        },
      });
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Registration failed. Please verify your information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-100">
      {/* ---------------- Left Hero Showcase (Desktop) ---------------- */}
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
            <Sparkles size={14} className="text-indigo-400" />
            Join TechNova Enterprise Workspace
          </div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Connect Every Piece of <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent">
              Institutional Knowledge
            </span>
          </h2>

          <p className="text-sm leading-relaxed text-slate-400">
            Create an enterprise account to automatically map codebases with CodeMind AST,
            query cross-department documentation, and leverage grounded AI reasoning.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs text-slate-300">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Role-Based Access Control (Admin & Employee governance)</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs text-slate-300">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>High-accuracy RAG with hybrid dense-sparse vector scoring</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs text-slate-300">
              <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Automated background synchronization with Celery & Redis</span>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-indigo-400" />
            <span className="text-slate-400">Zero-Trust Enterprise Security</span>
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
            <h1 className="text-2xl font-bold tracking-tight text-white">Create Account</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Join TechNova's unified memory workspace.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={150}
                  placeholder="Alex Rivera"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Corporate Email Address
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
                  placeholder="alex@technova.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">
                Password
              </label>
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
                  minLength={8}
                  placeholder="At least 8 characters"
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
              <p className="mt-1 text-[11px] text-slate-500">
                Must be at least 8 characters long.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
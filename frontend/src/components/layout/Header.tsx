import { useState, useRef, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Search,
  Sparkles,
  Command,
  ShieldCheck,
  User,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-6 shadow-2xs">
      {/* ---------------- Left Section: Title & Status ---------------- */}
      <div className="flex items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900">
              TechNova
            </h1>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
              Workspace
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="font-medium text-emerald-700">Memory Engine Online</span>
            <span className="text-slate-300">•</span>
            <span className="hidden sm:inline text-slate-400">PostgreSQL • Qdrant • Neo4j</span>
          </div>
        </div>
      </div>

      {/* ---------------- Right Section: Search, Actions, Profile ---------------- */}
      <div className="flex items-center gap-3">
        {/* Quick Search Input */}
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            onClick={() => navigate("/search")}
            placeholder="Search documents, code, graph..."
            readOnly
            className="w-64 cursor-pointer rounded-xl border border-slate-200 bg-slate-50/80 py-1.5 pl-9 pr-12 text-xs text-slate-700 placeholder-slate-400 transition hover:bg-slate-100/80 hover:border-slate-300 focus:outline-none"
          />
          <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 shadow-2xs">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>

        {/* AI Shortcut Button */}
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:brightness-105 active:scale-95"
        >
          <Sparkles size={13} className="text-indigo-200" />
          <span>Ask AI</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <Bell size={17} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 p-1.5 pr-2.5 transition hover:bg-slate-50 focus:outline-none"
          >
            {/* Avatar Pill */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-xs">
              {getInitials(user?.name)}
            </div>

            <div className="hidden text-left sm:block">
              <p className="max-w-28 truncate text-xs font-semibold text-slate-800">
                {user?.name || "User"}
              </p>
              <div className="flex items-center gap-1">
                {user?.role === "admin" ? (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600">
                    <ShieldCheck size={11} /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-slate-500">
                    <User size={10} /> Member
                  </span>
                )}
              </div>
            </div>

            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="truncate text-xs font-semibold text-slate-900">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  {user?.email || "user@technova.com"}
                </p>
                <div className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  {user?.role || "Employee"}
                </div>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/settings");
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <span>Workspace Settings</span>
                  <ExternalLink size={13} className="text-slate-400" />
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
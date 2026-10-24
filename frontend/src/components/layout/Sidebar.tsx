import {
  LayoutDashboard,
  Building2,
  PlugZap,
  FileText,
  Network,
  Bot,
  Search,
  Settings,
  ShieldCheck,
  Code2,
  Sparkles,
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const mainNav = [
    { title: "Dashboard", icon: LayoutDashboard, path: "/dashboard", badge: "Live" },
    { title: "AI Assistant", icon: Bot, path: "/chat", badge: "Gemini" },
    { title: "CodeMind", icon: Code2, path: "/codemind", badge: "AST" },
    { title: "Knowledge Graph", icon: Network, path: "/graph" },
    { title: "Documents", icon: FileText, path: "/documents" },
    { title: "Search", icon: Search, path: "/search" },
  ];

  const adminNav = [
    { title: "Data Sources", icon: PlugZap, path: "/connectors" },
    { title: "Admin Center", icon: ShieldCheck, path: "/admin" },
  ];

  const bottomNav = [
    { title: "Organization", icon: Building2, path: "/organization" },
    { title: "Settings", icon: Settings, path: "/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const renderNavLinks = (items: typeof mainNav) => {
    return items.map((item) => {
      const Icon = item.icon;
      return (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `group relative flex items-center justify-between mx-3 mb-1 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center gap-3">
                <Icon
                  size={19}
                  className={`transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-400"
                  }`}
                />
                <span>{item.title}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </NavLink>
      );
    });
  };

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Sparkles size={20} className="text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-white tracking-tight">Memora AI</h1>
                  <span className="text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.2 rounded">
                    v1.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate max-w-[130px]">Enterprise Memory</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="py-4 overflow-y-auto max-h-[calc(100vh-190px)]">
          <div className="px-5 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Workspace
            </span>
          </div>
          <nav>{renderNavLinks(mainNav)}</nav>

          {user?.role === "admin" && (
            <>
              <div className="px-5 mt-5 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Administration
                </span>
              </div>
              <nav>{renderNavLinks(adminNav)}</nav>
            </>
          )}

          <div className="px-5 mt-5 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              General
            </span>
          </div>
          <nav>{renderNavLinks(bottomNav)}</nav>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-semibold text-sm flex items-center justify-center shadow-inner shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || "User"}</p>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                  {user?.role || "Employee"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

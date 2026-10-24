import { useState } from "react";
import {
  LogOut,
  ShieldCheck,
  User,
  Building,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [message] = useState("");

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
    <div className="space-y-6 max-w-4xl">
      {/* ---------------- Header ---------------- */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
            <User size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Account Profile & Security Controls
            </h1>
            <p className="text-xs text-slate-500">
              Review your user identity, cryptographic permissions, and enterprise access tier.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 shadow-xs flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 font-bold text-lg text-white shadow-md shadow-indigo-500/20">
            {getInitials(user?.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 truncate">{user?.name || "Authorized User"}</h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 border border-indigo-200">
                {user?.role || "employee"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 flex items-center gap-1.5">
              <Mail size={13} className="text-slate-400" />
              <span>{user?.email || "user@technova.internal"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Building size={18} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Organization Scope
            </h3>
          </div>

          <div className="space-y-3">
            <InfoRow label="Tenant ID" value={`#${user?.organization_id ?? 1}`} mono />
            <InfoRow label="Department Allocation" value={user?.department_id ? `Dept #${user.department_id}` : "Global Workspace"} />
            <InfoRow label="Access Clearance" value={user?.role === "admin" ? "Full Root Administrator" : "Project-Scoped Member"} />
            <InfoRow label="Approval Status" value={user?.approval_status || "Approved"} badge="emerald" />
          </div>
        </section>

        {/* Security & Authentication */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Security & Session
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <InfoRow label="Authentication Type" value="HMAC-SHA256 Bearer JWT" mono />
              <InfoRow label="Account State" value={user?.is_active ? "Active & Authorized" : "Inactive"} badge="emerald" />
              <InfoRow label="Vector Engine Scope" value="Isolated Multi-Tenant Subgraph" />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition active:scale-98"
            >
              <LogOut size={15} />
              <span>Sign Out of Current Session</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
  badge,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badge?: "emerald" | "indigo";
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-slate-500 font-medium">{label}</span>
      {badge ? (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          {value}
        </span>
      ) : (
        <span className={`font-semibold text-slate-800 ${mono ? "font-mono" : ""}`}>{value}</span>
      )}
    </div>
  );
}

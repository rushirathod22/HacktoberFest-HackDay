import { useEffect, useState } from "react";
import {
  Building2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getOrganizationAdmin, updateOrganizationAdmin } from "../../services/api/admin";

export default function Organization() {
  const { user } = useAuth();
  const [org, setOrg] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      getOrganizationAdmin(user.organization_id)
        .then(setOrg)
        .catch((e) => setError(e?.response?.data?.detail || "Unable to load organization metadata"));
    }
  }, [user]);

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateOrganizationAdmin(org.id, {
        name: org.name,
        description: org.description,
      });
      setMessage("Organization details successfully updated.");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to update organization settings.");
    } finally {
      setSaving(false);
    }
  };

  if (!org) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-slate-400">
        Loading organization profile...
      </div>
    );
  }

  const isAdmin = user?.role === "admin";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ---------------- Header ---------------- */}
      <div>
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Organization Context & Tenancy
            </h1>
            <p className="text-xs text-slate-500">
              Manage enterprise tenant settings, shared domain verification, and organizational context.
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

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-xs">
          {error}
        </div>
      )}

      {/* Profile Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Enterprise Tenant Information</h2>
            <p className="text-xs text-slate-400">Scoped database partition and Neo4j graph subgraphs</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
            Tenant ID: #{org.id}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-slate-700">Organization Name</label>
            <input
              type="text"
              value={org.name || ""}
              disabled={!isAdmin}
              onChange={(e) => setOrg({ ...org, name: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-none disabled:opacity-70"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Tenant Slug / Identifier</label>
            <input
              type="text"
              value={org.slug || ""}
              disabled
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 font-mono text-xs text-slate-600"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700">Enterprise Overview & Context</label>
            <p className="text-[11px] text-slate-400 mb-1.5">
              This system context is injected into RAG queries to disambiguate enterprise domain terms.
            </p>
            <textarea
              rows={4}
              value={org.description || ""}
              disabled={!isAdmin}
              onChange={(e) => setOrg({ ...org, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none disabled:opacity-70"
              placeholder="Describe the company, core business operations, and target industries..."
            />
          </div>
        </div>

        {isAdmin && (
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? "Saving Changes..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

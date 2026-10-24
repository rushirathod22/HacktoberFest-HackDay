import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Building2,
  Database,
  FileText,
  Layers3,
  MessageSquare,
  RefreshCw,
  Loader2,
  AlertCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { getAdminDashboard } from "../../services/api/adminDashboard";
import type { AdminDashboardData } from "../../services/api/adminDashboard";
import { useAuth } from "../../context/AuthContext";
import EmployeeDashboard from "./EmployeeDashboard";
import { queueAllBackgroundSyncs } from "../../services/api/sync";

function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const dashboard = await getAdminDashboard();
      setData(dashboard);
    } catch (err: any) {
      console.error("Failed to load admin dashboard:", err);
      setError(
        err?.response?.data?.detail || "Failed to load dashboard metrics."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncMessage("");
    setError("");

    try {
      await queueAllBackgroundSyncs();
      setSyncMessage("Synchronization queued. Ingesting sources in background...");

      for (let attempt = 0; attempt < 15; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const dashboard = await getAdminDashboard();
        setData(dashboard);

        const hasActiveJobs =
          dashboard.sync_jobs.pending > 0 || dashboard.sync_jobs.running > 0;

        if (!hasActiveJobs) {
          setSyncMessage("Synchronization cycle completed successfully.");
          break;
        }

        setSyncMessage("Background ingestion in progress...");
      }
    } catch (err: any) {
      console.error("Failed to synchronize:", err);
      setError(
        err?.response?.data?.detail || "Failed to trigger background synchronization."
      );
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 size={28} className="animate-spin text-indigo-600" />
        <p className="text-xs font-semibold text-slate-500">
          Loading Enterprise Engine Telemetry...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle size={22} className="mt-0.5 text-red-600 shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-bold text-red-900">
              Telemetry Ingestion Failure
            </h2>
            <p className="mt-1 text-xs text-red-700">{error}</p>
            <button
              onClick={loadDashboard}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
            >
              <RefreshCw size={14} />
              <span>Retry Telemetry</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* =========================================
          Admin Dashboard Header
      ========================================== */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Governance Center
            </h1>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
              Real-Time
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {data?.organization?.name || "TechNova Enterprise"} — Ingestion status & neural telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncAll}
            disabled={syncing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {syncing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <RefreshCw size={14} />
            )}
            <span>{syncing ? "Ingesting..." : "Sync All Sources"}</span>
          </button>

          <button
            onClick={loadDashboard}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-3 text-xs font-medium text-indigo-800">
          <Activity size={16} className="text-indigo-600 animate-pulse" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* =========================================
          Top 5 KPI Metric Cards
      ========================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Organizations"
          value="1"
          sub="Primary Tenant"
          color="indigo"
          icon={<Building2 size={20} />}
        />
        <KpiCard
          title="Data Sources"
          value={String(data?.sources?.total ?? 0)}
          sub={`${data?.sources?.active ?? 0} active syncs`}
          color="blue"
          icon={<Database size={20} />}
        />
        <KpiCard
          title="Indexed Docs"
          value={String(data?.documents?.total ?? 0)}
          sub={`${data?.documents?.completed ?? 0} fully parsed`}
          color="violet"
          icon={<FileText size={20} />}
        />
        <KpiCard
          title="Vector Chunks"
          value={String(data?.chunks?.total ?? 0)}
          sub="Qdrant embeddings"
          color="cyan"
          icon={<Layers3 size={20} />}
        />
        <KpiCard
          title="AI Conversations"
          value={String(data?.conversations?.total ?? 0)}
          sub={`${data?.conversations?.messages ?? 0} messages`}
          color="amber"
          icon={<MessageSquare size={20} />}
        />
      </div>

      {/* =========================================
          Row 1: Users & Data Sources
      ========================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="User Demographics & Access" icon={<Building2 size={16} className="text-indigo-600" />}>
          <StatRow label="Total Registered Users" value={data?.users?.total ?? 0} />
          <StatRow label="Active Accounts" value={data?.users?.active ?? 0} />
          <StatRow label="System Administrators" value={data?.users?.admins ?? 0} badge="Admin Role" />
          <StatRow label="Employees & Members" value={data?.users?.employees ?? 0} badge="Member Role" />
        </SectionCard>

        <SectionCard title="Connectors & Ingestion Sources" icon={<Database size={16} className="text-blue-600" />}>
          <StatRow label="Total Configured Sources" value={data?.sources?.total ?? 0} />
          <StatRow label="Active & Online" value={data?.sources?.active ?? 0} highlight="emerald" />
          <StatRow label="Idle / Inactive" value={data?.sources?.inactive ?? 0} />
          <StatRow label="Sync Errors" value={data?.sources?.error ?? 0} highlight={(data?.sources?.error ?? 0) > 0 ? "red" : undefined} />
        </SectionCard>
      </div>

      {/* =========================================
          Row 2: Document Processing & Sync Jobs
      ========================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Document Parsing Pipeline" icon={<FileText size={16} className="text-violet-600" />}>
          <StatRow label="Total Ingested Files" value={data?.documents?.total ?? 0} />
          <StatRow label="Completed Embeddings" value={data?.documents?.completed ?? 0} highlight="emerald" />
          <StatRow label="Parsing in Flight" value={data?.documents?.processing ?? 0} highlight={(data?.documents?.processing ?? 0) > 0 ? "indigo" : undefined} />
          <StatRow label="Pending Queue" value={data?.documents?.pending ?? 0} />
          <StatRow label="Failed Extractions" value={data?.documents?.failed ?? 0} highlight={(data?.documents?.failed ?? 0) > 0 ? "red" : undefined} />
        </SectionCard>

        <SectionCard title="Celery Background Workers" icon={<RefreshCw size={16} className="text-cyan-600" />}>
          <StatRow label="Total Job Executions" value={data?.sync_jobs?.total ?? 0} />
          <StatRow label="Successfully Processed" value={data?.sync_jobs?.completed ?? 0} highlight="emerald" />
          <StatRow label="Active Running Workers" value={data?.sync_jobs?.running ?? 0} highlight={(data?.sync_jobs?.running ?? 0) > 0 ? "indigo" : undefined} />
          <StatRow label="Redis Broker Queue" value={data?.sync_jobs?.pending ?? 0} />
          <StatRow label="Job Failures" value={data?.sync_jobs?.failed ?? 0} highlight={(data?.sync_jobs?.failed ?? 0) > 0 ? "red" : undefined} />
        </SectionCard>
      </div>

      {/* =========================================
          Row 3: Knowledge Graph & AI Metrics
      ========================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Neo4j Knowledge Graph Telemetry" icon={<Sparkles size={16} className="text-violet-600" />}>
          <StatRow label="Total Graph Nodes" value={data?.knowledge_graph?.total_nodes ?? 0} />
          <StatRow label="Indexed Projects" value={data?.knowledge_graph?.projects ?? 0} />
          <StatRow label="Technologies & Frameworks" value={data?.knowledge_graph?.technologies ?? 0} />
          <StatRow label="Database Entities" value={data?.knowledge_graph?.databases ?? 0} />
          <StatRow label="Linked Documents" value={data?.knowledge_graph?.documents ?? 0} />
          <StatRow label="Total Semantic Relationships" value={data?.knowledge_graph?.total_relationships ?? 0} highlight="indigo" />
        </SectionCard>

        <SectionCard title="AI Intelligence & Token Usage" icon={<MessageSquare size={16} className="text-amber-600" />}>
          <StatRow label="Total Prompt Queries" value={data?.ai_usage?.queries ?? 0} />
          <StatRow label="Neural Responses Generated" value={data?.ai_usage?.responses ?? 0} />
          <StatRow label="Files Discovered in Scope" value={data?.sync_jobs?.files_found ?? 0} />
          <StatRow label="Files Processed via Vectorizer" value={data?.sync_jobs?.files_processed ?? 0} highlight="emerald" />
        </SectionCard>
      </div>

      {/* =========================================
          Recent Sync Activity Table
      ========================================== */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Recent Ingestion Telemetry
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Audit log of latest synchronization jobs and parser results
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {(data?.recent_activity ?? []).length} Entries
          </span>
        </div>

        {(data?.recent_activity ?? []).length === 0 ? (
          <div className="py-10 text-center">
            <Database size={24} className="mx-auto text-slate-300" />
            <p className="mt-2 text-xs text-slate-400">
              No synchronization jobs recorded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500">
                  <th className="pb-3 font-semibold">Data Source</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Parsed Files</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.recent_activity ?? []).map((activity) => (
                  <tr key={activity.id} className="transition hover:bg-slate-50/80">
                    <td className="py-3 font-semibold text-slate-900">
                      {activity.source_name}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          activity.status.toLowerCase() === "completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : activity.status.toLowerCase() === "running"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse"
                            : "bg-slate-100 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-600">
                      {activity.files_processed} / {activity.files_found}
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(activity.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================
          System Health Telemetry
      ========================================== */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">
          Core Infrastructure Health
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <HealthBadge
            label="PostgreSQL Relational DB"
            status={data?.system_health?.database || "Healthy"}
          />
          <HealthBadge
            label="Celery Asynchronous Ingestion"
            status={data?.system_health?.ingestion || "Healthy"}
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================
   Modern KPI Card
================================================ */
function KpiCard({
  title,
  value,
  sub,
  color,
  icon,
}: {
  title: string;
  value: string;
  sub: string;
  color: "indigo" | "blue" | "violet" | "cyan" | "amber";
  icon: ReactNode;
}) {
  const colorMap = {
    indigo: "border-indigo-500/20 text-indigo-600 bg-indigo-50/50",
    blue: "border-blue-500/20 text-blue-600 bg-blue-50/50",
    violet: "border-violet-500/20 text-violet-600 bg-violet-50/50",
    cyan: "border-cyan-500/20 text-cyan-600 bg-cyan-50/50",
    amber: "border-amber-500/20 text-amber-600 bg-amber-50/50",
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{title}</span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${colorMap[color]}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

/* ================================================
   Section Container Card
================================================ */
function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        {icon}
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/* ================================================
   Stat Row Component
================================================ */
function StatRow({
  label,
  value,
  badge,
  highlight,
}: {
  label: string;
  value: number;
  badge?: string;
  highlight?: "emerald" | "indigo" | "red";
}) {
  const highlightClass =
    highlight === "emerald"
      ? "text-emerald-600 font-bold"
      : highlight === "indigo"
      ? "text-indigo-600 font-bold"
      : highlight === "red"
      ? "text-red-600 font-bold"
      : "text-slate-900 font-semibold";

  return (
    <div className="flex items-center justify-between py-1.5 text-xs">
      <span className="text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
            {badge}
          </span>
        )}
        <span className={highlightClass}>{value}</span>
      </div>
    </div>
  );
}

/* ================================================
   Health Status Badge
================================================ */
function HealthBadge({
  label,
  status,
}: {
  label: string;
  status: string;
}) {
  const isHealthy =
    status.toLowerCase() === "healthy" || status.toLowerCase() === "connected" || status.toLowerCase() === "ok";

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-1.5">
        {isHealthy ? (
          <>
            <CheckCircle2 size={15} className="text-emerald-500" />
            <span className="text-xs font-semibold text-emerald-700 capitalize">
              {status}
            </span>
          </>
        ) : (
          <>
            <AlertTriangle size={15} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 capitalize">
              {status}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ================================================
   Root Dashboard Switcher
================================================ */
function Dashboard() {
  const { user } = useAuth();

  if (user?.role === "employee") {
    return <EmployeeDashboard />;
  }

  return <AdminDashboard />;
}

export default Dashboard;
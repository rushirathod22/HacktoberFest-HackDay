import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Search,
  Network,
  FileText,
  MessageSquare,
  ArrowRight,
  Loader2,
  Code2,
  Sparkles,
  Layers,
  FolderGit2,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getConversations } from "../../services/api/conversation";
import { getMyProjects } from "../../services/api/projects";
import type { Conversation } from "../../services/api/conversation";

function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [conversationData, projectData] = await Promise.all([
          getConversations(),
          getMyProjects(),
        ]);
        setConversations(conversationData.slice(0, 5));
        setProjects(projectData);
      } catch (error) {
        console.error("Failed to load employee dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-6">
      {/* =========================================
          Welcome Hero Banner
      ========================================== */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-lg">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 left-1/3 h-64 w-64 rounded-full bg-violet-600/15 blur-2xl" />

        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
              <Sparkles size={13} className="text-indigo-400" />
              Organizational Knowledge Portal
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {getTimeGreeting()},{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-violet-200 to-white bg-clip-text text-transparent">
                {user?.name || "Team Member"}
              </span>{" "}
              👋
            </h1>
            <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-slate-300 md:text-sm">
              Explore your company's indexed codebases, technical documentation, and cross-team knowledge graph
              with grounded AI assistance.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigate("/chat")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition hover:brightness-110 active:scale-95"
            >
              <Bot size={15} />
              <span>Ask AI Copilot</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/codemind")}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <Code2 size={15} className="text-indigo-400" />
              <span>Explore CodeMind</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          Quick Action Cards (Interactive Grid)
      ========================================== */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
            Quick Workspaces
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ActionCard
            title="AI Knowledge Assistant"
            description="Chat in natural language with source references and citations."
            badge="Gemini RAG"
            icon={<Bot size={20} />}
            gradient="from-indigo-600 to-blue-600"
            onClick={() => navigate("/chat")}
          />

          <ActionCard
            title="Semantic Search"
            description="Find exact answers across documents, code, and team history."
            badge="Vector Store"
            icon={<Search size={20} />}
            gradient="from-blue-600 to-cyan-600"
            onClick={() => navigate("/search")}
          />

          <ActionCard
            title="Knowledge Graph"
            description="Explore relationships between projects, services, and tech stacks."
            badge="Neo4j Graph"
            icon={<Network size={20} />}
            gradient="from-violet-600 to-purple-600"
            onClick={() => navigate("/graph")}
          />

          <ActionCard
            title="Organizational Docs"
            description="Browse all synchronized enterprise files, manuals, and schemas."
            badge="Documents"
            icon={<FileText size={20} />}
            gradient="from-emerald-600 to-teal-600"
            onClick={() => navigate("/documents")}
          />
        </div>
      </div>

      {/* =========================================
          Stats Overview (KPI Pills)
      ========================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <InfoCard
          title="Active Conversations"
          value={conversations.length}
          subtitle="AI query sessions"
          icon={<MessageSquare size={18} />}
        />

        <InfoCard
          title="Assigned Projects"
          value={projects.length}
          subtitle="Repositories in scope"
          icon={<FolderGit2 size={18} />}
        />

        <InfoCard
          title="System Architecture"
          value="Hybrid Engine"
          subtitle="AST + Neo4j + Qdrant"
          icon={<Layers size={18} />}
        />
      </div>

      {/* =========================================
          Two Columns: Assigned Projects & Recent Chats
      ========================================== */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Assigned Projects */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Assigned Code Projects
              </h2>
              <p className="text-xs text-slate-500">
                Repositories mapped with CodeMind AST
              </p>
            </div>
            <button
              onClick={() => navigate("/codemind")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Open CodeMind <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {projects.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active projects assigned yet.
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate("/codemind")}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FolderGit2 size={16} className="text-indigo-600" />
                      <span className="truncate text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                        {project.name}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {project.description || "Enterprise mapped project"}
                    </p>
                  </div>
                  <ArrowRight
                    size={15}
                    className="ml-2 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                  />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent AI Conversations */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent AI Sessions
              </h2>
              <p className="text-xs text-slate-500">
                Your historical questions and assistant answers
              </p>
            </div>
            <button
              onClick={() => navigate("/chat")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Start New <ArrowRight size={14} />
            </button>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={18} className="animate-spin text-slate-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare size={24} className="mx-auto text-slate-300" />
                <p className="mt-2 text-xs text-slate-400">
                  No previous conversations yet.
                </p>
                <button
                  onClick={() => navigate("/chat")}
                  className="mt-3 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Ask First Question
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => navigate(`/chat?conversation=${conv.id}`)}
                    className="flex w-full items-center justify-between rounded-xl border border-slate-100 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {conv.title || "Untitled Conversation"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {new Date(conv.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <ArrowRight size={14} className="shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =========================================
          Workflow Steps Guide (Interactive)
      ========================================== */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              How MemoraAI Powers Your Day
            </h2>
            <p className="text-xs text-slate-500">
              Four steps from question to verified organizational insight
            </p>
          </div>
          <Zap size={18} className="text-amber-500" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <WorkflowStep
            step="01"
            title="Ask Natural Language"
            description="Ask questions about any project, architecture decision, or employee workflow."
          />
          <WorkflowStep
            step="02"
            title="Hybrid Vector Search"
            description="Dense and sparse vectors retrieve matching documentation and code slices."
          />
          <WorkflowStep
            step="03"
            title="Graph Grounding"
            description="Neo4j traverses function dependencies and organizational relationships."
          />
          <WorkflowStep
            step="04"
            title="Cited Synthesis"
            description="Receive clear, hallucination-free answers backed by verifiable source references."
          />
        </div>
      </div>
    </div>
  );
}

/* ================================================
   Action Card Component
================================================ */
function ActionCard({
  title,
  description,
  badge,
  icon,
  gradient,
  onClick,
}: {
  title: string;
  description: string;
  badge: string;
  icon: ReactNode;
  gradient: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md"
    >
      <div>
        <div className="flex items-center justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${gradient} text-white shadow-sm`}
          >
            {icon}
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            {badge}
          </span>
        </div>

        <h3 className="mt-4 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-indigo-600">
        <span>Launch</span>
        <ArrowRight
          size={13}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </button>
  );
}

/* ================================================
   Info Card Component
================================================ */
function InfoCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">{subtitle}</p>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>
    </div>
  );
}

/* ================================================
   Workflow Step Component
================================================ */
function WorkflowStep({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <span className="font-mono text-xs font-bold text-indigo-600">
        {step}
      </span>
      <h3 className="mt-1.5 text-xs font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
        {description}
      </p>
    </div>
  );
}

export default EmployeeDashboard;
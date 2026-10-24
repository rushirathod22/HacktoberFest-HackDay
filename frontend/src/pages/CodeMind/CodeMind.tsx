import { useEffect, useMemo, useState } from "react";
import MarkdownContent from "../../components/common/MarkdownContent";
import {
  Code2,
  Loader2,
  Network,
  Sparkles,
  GitCommit,
  FileCode,
  Layers,
  Search,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ShieldCheck,
  ChevronRight,
  Cpu,
} from "lucide-react";
import { getMyProjects } from "../../services/api/projects";
import {
  askCodeMind,
  businessRule,
  codeSearch,
  getArchitecture,
  getCodeFiles,
  getCodeSymbols,
  getHistory,
  getProjectCodeRepositories,
  getDependencies,
  getImpact,
} from "../../services/api/codemind";

export default function CodeMind() {
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState<number | "">("");
  const [activeTab, setActiveTab] = useState<"ask" | "symbols" | "architecture" | "rules" | "git" | "files">("ask");

  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [refs, setRefs] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [files, setFiles] = useState<any[]>([]);
  const [symbols, setSymbols] = useState<any[]>([]);
  const [architecture, setArchitecture] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const [symbolSearch, setSymbolSearch] = useState("");
  const [selectedSymbol, setSelectedSymbol] = useState<any>(null);
  const [dependencies, setDependencies] = useState<any>(null);
  const [impact, setImpact] = useState<any[]>([]);

  const [businessRuleText, setBusinessRuleText] = useState("");
  const [businessRuleResult, setBusinessRuleResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyProjects()
      .then((data) => {
        setProjects(data || []);
        if (data && data.length > 0 && !projectId) {
          loadProject(data[0].id);
        }
      })
      .catch((e) => setError(e?.response?.data?.detail || "Unable to load assigned projects"));
  }, []);

  const loadProject = async (id: number) => {
    setProjectId(id);
    setError("");
    setAnswer("");
    setRefs([]);
    setSearchResults([]);
    setDependencies(null);
    setSelectedSymbol(null);
    setImpact([]);
    setBusinessRuleResult(null);
    setLoading(true);

    try {
      const [f, s, a, r, h] = await Promise.all([
        getCodeFiles(id),
        getCodeSymbols(id),
        getArchitecture(id),
        getProjectCodeRepositories(id),
        getHistory(id),
      ]);
      setFiles(f || []);
      setSymbols(s || []);
      setArchitecture(a || null);
      setRepos(r || []);
      setHistory(h || []);
    } catch (e: any) {
      console.error("CodeMind load error:", e);
      setError(e?.response?.data?.detail || "Unable to load CodeMind project metadata.");
    } finally {
      setLoading(false);
    }
  };

  const ask = async () => {
    if (!projectId || !query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const [a, s] = await Promise.all([
        askCodeMind(Number(projectId), query),
        codeSearch(Number(projectId), query, 8),
      ]);
      setAnswer(a.answer);
      setRefs(a.references || []);
      setSearchResults(s || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e.message || "CodeMind query failed");
    } finally {
      setLoading(false);
    }
  };

  const inspectSymbol = async (sym: any) => {
    if (!projectId) return;
    setSelectedSymbol(sym);
    setAnalysisLoading(sym.id);
    setError("");
    try {
      const [deps, effects] = await Promise.all([
        getDependencies(Number(projectId), sym.id),
        getImpact(Number(projectId), sym.id),
      ]);
      setDependencies(deps);
      setImpact(effects || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Unable to inspect symbol dependencies");
    } finally {
      setAnalysisLoading(null);
    }
  };

  const runBusinessRule = async () => {
    if (!projectId || !businessRuleText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await businessRule(Number(projectId), businessRuleText, 8);
      setBusinessRuleResult(res);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Unable to map business rule to codebase");
    } finally {
      setLoading(false);
    }
  };

  const languages = useMemo(
    () => Array.from(new Set(files.map((f) => f.language).filter(Boolean))),
    [files]
  );

  const filteredSymbols = useMemo(() => {
    if (!symbolSearch.trim()) return symbols.slice(0, 80);
    return symbols
      .filter(
        (s) =>
          s.qualified_name?.toLowerCase().includes(symbolSearch.toLowerCase()) ||
          s.name?.toLowerCase().includes(symbolSearch.toLowerCase()) ||
          s.file_path?.toLowerCase().includes(symbolSearch.toLowerCase())
      )
      .slice(0, 80);
  }, [symbols, symbolSearch]);

  const starterQueries = [
    "Explain the payment and refund logic in PayFlow",
    "Where is the refund amount validated against the payment amount?",
    "List all database models and relationships",
    "How does customer invoice generation work?",
  ];

  return (
    <div className="space-y-6">
      {/* ---------------- Header & Project Selector ---------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
              <Code2 size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                CodeMind AST Intelligence Studio
              </h1>
              <p className="text-xs text-slate-500">
                Deep abstract syntax tree parsing, call-graph tracing, and rule-to-code verification.
              </p>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Active Project:</label>
          <select
            value={projectId}
            onChange={(e) => e.target.value && loadProject(Number(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none"
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-600 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ---------------- KPI Metric Cards ---------------- */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <MetricCard
          title="Repositories"
          value={repos.length}
          icon={FolderTree}
          subtitle="Indexed AST repos"
          color="indigo"
        />
        <MetricCard
          title="Indexed Files"
          value={files.length}
          icon={FileCode}
          subtitle="Source code units"
          color="cyan"
        />
        <MetricCard
          title="AST Symbols"
          value={symbols.length}
          icon={Cpu}
          subtitle="Classes, methods & funcs"
          color="violet"
        />
        <MetricCard
          title="Languages"
          value={languages.length || 1}
          icon={Layers}
          subtitle={languages.join(", ") || "Python, TS"}
          color="emerald"
        />
        <MetricCard
          title="Git Commits"
          value={history.length}
          icon={GitCommit}
          subtitle="Recorded revisions"
          color="amber"
        />
      </div>

      {/* ---------------- Studio Tabs ---------------- */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-2 pt-2">
        <TabButton
          active={activeTab === "ask"}
          onClick={() => setActiveTab("ask")}
          icon={Sparkles}
          label="Ask CodeMind"
        />
        <TabButton
          active={activeTab === "symbols"}
          onClick={() => setActiveTab("symbols")}
          icon={Network}
          label="Symbols & Dependencies"
          count={symbols.length}
        />
        <TabButton
          active={activeTab === "architecture"}
          onClick={() => setActiveTab("architecture")}
          icon={Layers}
          label="Architecture & Layers"
        />
        <TabButton
          active={activeTab === "rules"}
          onClick={() => setActiveTab("rules")}
          icon={ShieldCheck}
          label="Business Rules Mapping"
        />
        <TabButton
          active={activeTab === "git"}
          onClick={() => setActiveTab("git")}
          icon={GitCommit}
          label="Git Timeline"
          count={history.length}
        />
        <TabButton
          active={activeTab === "files"}
          onClick={() => setActiveTab("files")}
          icon={FileCode}
          label="File Tree"
          count={files.length}
        />
      </div>

      {/* ---------------- Tab 1: Ask CodeMind ---------------- */}
      {activeTab === "ask" && (
        <div className="space-y-6">
          {/* Ask Input Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Semantic Code Reasoning</h2>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask();
                }}
                placeholder="Ask about classes, functions, or business logic flow..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={ask}
                disabled={loading || !query.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:brightness-105 disabled:opacity-50 active:scale-95"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                <span>Analyze Code</span>
              </button>
            </div>

            {/* Quick Starter Chips */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400">Try asking:</span>
              {starterQueries.map((q, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(q);
                  }}
                  className="rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 text-[11px] font-medium text-slate-600 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Answer Display */}
            {answer && (
              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/20 p-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Sparkles size={14} className="text-indigo-600" />
                    <span>AST Synthesis Answer</span>
                  </div>
                </div>
                <div className="prose prose-xs max-w-none text-slate-800">
                  <MarkdownContent content={answer} />
                </div>
              </div>
            )}
          </div>

          {/* References & Semantic Search Results */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* References */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  AST Symbol References ({refs.length})
                </h3>
              </div>
              {refs.length === 0 ? (
                <EmptyState message="No symbol references loaded. Ask a code question above." />
              ) : (
                <div className="space-y-2">
                  {refs.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:border-indigo-200 hover:shadow-2xs transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-700">
                          {r.symbol_name || "Code Segment"}
                        </span>
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-600 font-mono">
                          L{r.start_line}-{r.end_line}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[11px] text-slate-500 truncate">{r.file_path}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Semantic Search Code Chunks */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Vector Code Matches ({searchResults.length})
                </h3>
              </div>
              {searchResults.length === 0 ? (
                <EmptyState message="No vector matches yet." />
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {searchResults.map((r, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:border-indigo-200 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-slate-900">
                          {r.symbol_name || "Code Chunk"}
                        </span>
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                          Score {Number(r.score || 0).toFixed(3)}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-slate-500 truncate">{r.file_path}</p>
                      {r.content && (
                        <pre className="mt-2 line-clamp-3 rounded bg-slate-900 p-2 text-[10px] text-emerald-400 font-mono">
                          {r.content}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Tab 2: Symbols & Dependency Graph ---------------- */}
      {activeTab === "symbols" && (
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Symbols List */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                AST Symbols Directory ({filteredSymbols.length})
              </h3>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={symbolSearch}
                onChange={(e) => setSymbolSearch(e.target.value)}
                placeholder="Filter symbols or files..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="max-h-[500px] overflow-y-auto space-y-1.5 pr-1">
              {filteredSymbols.map((s) => {
                const isSelected = selectedSymbol?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => inspectSymbol(s)}
                    className={`flex w-full items-start justify-between rounded-xl p-2.5 text-left transition ${
                      isSelected
                        ? "bg-indigo-50/80 border border-indigo-200 shadow-2xs"
                        : "hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                          {s.symbol_type || "func"}
                        </span>
                        <span className="font-mono text-xs font-semibold text-slate-900 truncate">
                          {s.name || s.qualified_name}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-slate-400 truncate">{s.file_path}</p>
                    </div>
                    {analysisLoading === s.id ? (
                      <Loader2 size={14} className="animate-spin text-indigo-600 self-center" />
                    ) : (
                      <ChevronRight size={14} className="text-slate-400 self-center" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Symbol Inspector & Blast Radius */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            {!selectedSymbol ? (
              <EmptyState message="Select an AST symbol from the left to trace its callers, callees, and impact radius." />
            ) : (
              <div className="space-y-6">
                {/* Selected Symbol Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                      {selectedSymbol.symbol_type || "Symbol"}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      Lines {selectedSymbol.start_line} - {selectedSymbol.end_line}
                    </span>
                  </div>
                  <h2 className="mt-2 font-mono text-base font-bold text-slate-900">
                    {selectedSymbol.qualified_name}
                  </h2>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">{selectedSymbol.file_path}</p>
                </div>

                {/* Callers & Callees */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Callers */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700">Callers (Inbound)</span>
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                        {dependencies?.callers?.length || 0}
                      </span>
                    </div>
                    {(!dependencies?.callers || dependencies.callers.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No incoming call edges found.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {dependencies.callers.map((c: any, i: number) => (
                          <div key={i} className="rounded bg-white p-2 text-xs font-mono text-slate-700 shadow-2xs border border-slate-100">
                            {c.caller_name || c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Callees */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-700">Callees (Outbound)</span>
                      <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">
                        {dependencies?.callees?.length || 0}
                      </span>
                    </div>
                    {(!dependencies?.callees || dependencies.callees.length === 0) ? (
                      <p className="text-xs text-slate-400 italic">No outgoing call invocations.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {dependencies.callees.map((c: any, i: number) => (
                          <div key={i} className="rounded bg-white p-2 text-xs font-mono text-slate-700 shadow-2xs border border-slate-100">
                            {c.callee_name || c}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Blast Radius / Impact */}
                <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <AlertTriangle size={14} className="text-amber-600" />
                      <span>Blast-Radius & Impact Analysis</span>
                    </div>
                    <span className="text-xs font-semibold text-amber-800">
                      {impact.length} affected dependents
                    </span>
                  </div>
                  {impact.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      Low modification risk: This symbol has zero cascading downstream consumers.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1">
                      {impact.map((imp: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded bg-white p-2 text-xs font-mono text-slate-800 border border-amber-100">
                          <span>{imp.symbol || imp.name || JSON.stringify(imp)}</span>
                          <span className="text-[10px] text-amber-700 font-bold">Indirect impact</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Tab 3: Architecture & Layers ---------------- */}
      {activeTab === "architecture" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ArchitectureCard
              title="API & Routing Layer"
              desc="FastAPI routers and endpoint controllers"
              badge="FastAPI"
              items={files.filter((f) => f.file_path?.includes("api") || f.file_path?.includes("route"))}
            />
            <ArchitectureCard
              title="Business & Service Domain"
              desc="Core business workflows and AST analyzers"
              badge="Services"
              items={files.filter((f) => f.file_path?.includes("service"))}
            />
            <ArchitectureCard
              title="Data Models & Schemas"
              desc="SQLAlchemy ORM models and Pydantic schemas"
              badge="Data Tier"
              items={files.filter((f) => f.file_path?.includes("model") || f.file_path?.includes("schema"))}
            />
            <ArchitectureCard
              title="Repositories & Queries"
              desc="Database access abstraction layers"
              badge="Storage"
              items={files.filter((f) => f.file_path?.includes("repositor"))}
            />
            <ArchitectureCard
              title="Connectors & Ingestion"
              desc="Git, local file, and database connectors"
              badge="Ingestion"
              items={files.filter((f) => f.file_path?.includes("connector"))}
            />
            <ArchitectureCard
              title="Core & Security"
              desc="JWT tokens, password hashing, and logging"
              badge="Security"
              items={files.filter((f) => f.file_path?.includes("core") || f.file_path?.includes("security"))}
            />
          </div>

          {/* Raw Architecture Summary Viewer */}
          {architecture && (
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 shadow-xs text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-indigo-400">
                  SYSTEM_TOPOLOGY_METADATA.JSON
                </span>
              </div>
              <pre className="max-h-64 overflow-y-auto font-mono text-xs text-slate-300">
                {JSON.stringify(architecture, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 4: Business Rules Mapping ---------------- */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Map Natural Language Policy to Code</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Enter any organizational policy or rule to automatically locate matching validation methods and boundary conditions in the codebase.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={businessRuleText}
                onChange={(e) => setBusinessRuleText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runBusinessRule();
                }}
                placeholder="e.g. Refund cannot exceed original payment amount..."
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={runBusinessRule}
                disabled={loading || !businessRuleText.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-slate-800 disabled:opacity-50"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
                <span>Verify Rule</span>
              </button>
            </div>

            {/* Quick Example Policies */}
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Refund cannot exceed original payment amount",
                "Customer must exist before payment creation",
                "Invoice status changes to PAID upon successful transaction",
              ].map((rule, idx) => (
                <button
                  key={idx}
                  onClick={() => setBusinessRuleText(rule)}
                  className="rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-3 py-1 text-[11px] font-medium text-slate-600 transition"
                >
                  {rule}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {businessRuleResult && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">Rule Compliance Verification</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Verified in AST
                </span>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 font-mono text-xs text-slate-800 max-h-96 overflow-y-auto">
                <pre>{JSON.stringify(businessRuleResult, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 5: Git Timeline ---------------- */}
      {activeTab === "git" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Commit History & AST Ingestion Timeline ({history.length})
            </h3>
          </div>
          {history.length === 0 ? (
            <EmptyState message="No commit history indexed for this project." />
          ) : (
            <div className="space-y-3">
              {history.map((h, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-4 hover:bg-white hover:border-indigo-200 hover:shadow-2xs transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
                      <GitCommit size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{h.message}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-700">{h.author_name || "Committer"}</span>
                        <span>•</span>
                        <span>
                          {h.committed_at ? new Date(h.committed_at).toLocaleString() : "Recent"}
                        </span>
                        {h.changed_files && (
                          <>
                            <span>•</span>
                            <span>{h.changed_files.length} files changed</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {h.additions !== undefined && (
                      <span className="rounded bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700">
                        +{h.additions}
                      </span>
                    )}
                    {h.deletions !== undefined && (
                      <span className="rounded bg-rose-50 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-700">
                        -{h.deletions}
                      </span>
                    )}
                    <span className="rounded-lg border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-600 font-semibold shadow-2xs">
                      {h.sha?.slice(0, 8)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 6: File Tree ---------------- */}
      {activeTab === "files" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Source Code File Index ({files.length})
            </h3>
            <button
              onClick={() => loadProject(Number(projectId))}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              Refresh Files
            </button>
          </div>

          <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
            {files.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCode size={16} className="text-slate-400 shrink-0" />
                  <span className="font-mono text-xs font-semibold text-slate-800 truncate">
                    {f.file_path}
                  </span>
                </div>
                <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                  {f.language || "code"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: number;
  icon: any;
  subtitle: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:shadow-md">
      <div className="flex items-center justify-between text-slate-500">
        <span className="text-xs font-bold tracking-tight text-slate-600">{title}</span>
        <Icon size={16} className="text-indigo-600" />
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      <p className="mt-0.5 text-[11px] text-slate-400 truncate">{subtitle}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-all ${
        active
          ? "border-indigo-600 text-indigo-700"
          : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
            active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function ArchitectureCard({
  title,
  desc,
  badge,
  items,
}: {
  title: string;
  desc: string;
  badge: string;
  items: any[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
          {badge}
        </span>
        <span className="text-xs font-bold text-indigo-600">{items.length} units</span>
      </div>
      <h3 className="text-xs font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-[11px] text-slate-500 leading-snug">{desc}</p>

      <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3">
        {items.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">No files classified in this layer.</p>
        ) : (
          items.slice(0, 4).map((f) => (
            <div key={f.id} className="font-mono text-[10px] text-slate-600 truncate">
              {f.file_path}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center">
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}

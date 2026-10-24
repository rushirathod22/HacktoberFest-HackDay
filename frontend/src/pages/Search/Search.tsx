import { useState } from "react";
import {
  Loader2,
  Search as SearchIcon,
  Sparkles,
  FileText,
  Code2,
  Copy,
  Check,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { semanticSearch, type SearchResult } from "../../services/api/search";

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterScope, setFilterScope] = useState<"all" | "code" | "docs">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await semanticSearch(query.trim(), 12);
      setResults(data || []);
    } catch (e: any) {
      console.error("Semantic search failed:", e);
      setError(e?.response?.data?.detail || "Semantic search failed. Ensure Qdrant vector index is online.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterKeywords = [
    "Refund processing limits",
    "Customer authentication flow",
    "PostgreSQL transaction isolation",
    "Neo4j relationship graph extraction",
    "PayFlow payment schemas",
  ];

  const filteredResults = results.filter((r) => {
    if (filterScope === "code") {
      return (
        r.reference.file_path.endsWith(".py") ||
        r.reference.file_path.endsWith(".ts") ||
        r.reference.file_path.includes("code")
      );
    }
    if (filterScope === "docs") {
      return (
        r.reference.file_path.endsWith(".md") ||
        r.reference.file_path.endsWith(".txt") ||
        r.reference.file_path.includes("doc")
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ---------------- Header ---------------- */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200/80 mb-3">
          <Sparkles size={14} className="text-indigo-600" />
          <span>Vector Similarity & AST Hybrid Search</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Multi-Modal Semantic Search
        </h1>
        <p className="mt-1 text-xs text-slate-500 max-w-lg mx-auto">
          Query authorized documents, CodeMind symbols, and organizational knowledge via 768-dim dense embeddings.
        </p>
      </div>

      {/* ---------------- Spotlight Search Bar ---------------- */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-indigo-500/5 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
        <div className="flex items-center gap-3 px-3">
          <SearchIcon size={20} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
            placeholder="Search code architecture, customer models, payment policies, or AST symbols..."
            className="w-full bg-transparent py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={runSearch}
            disabled={loading || !query.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:brightness-105 disabled:opacity-50 active:scale-95 shrink-0"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <SearchIcon size={15} />}
            <span>Search</span>
          </button>
        </div>

        {/* Filter Pills & Starters */}
        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-100 px-3 pt-3 gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400">Filter Scope:</span>
            <button
              onClick={() => setFilterScope("all")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filterScope === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterScope("docs")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filterScope === "docs"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Documentation
            </button>
            <button
              onClick={() => setFilterScope("code")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                filterScope === "code"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Source Code
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
            <span>Try:</span>
            {starterKeywords.slice(0, 3).map((kw, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuery(kw);
                }}
                className="hover:text-indigo-600 hover:underline"
              >
                {kw}
                {i < 2 ? "," : ""}
              </button>
            ))}
          </div>
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

      {/* ---------------- Results ---------------- */}
      <div className="space-y-4">
        {results.length > 0 && (
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>
              Found <strong className="text-slate-800">{filteredResults.length}</strong> semantic matches
            </span>
            <span>Sorted by Cosine Similarity</span>
          </div>
        )}

        {filteredResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <SearchIcon size={32} className="text-slate-300 mb-2" />
            <h3 className="text-sm font-bold text-slate-700">
              {query ? "No semantic matches found." : "Ready to explore the knowledge base."}
            </h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm">
              Type a natural query like "how does refund validation work?" to search across indexed repositories and docs.
            </p>
          </div>
        ) : (
          filteredResults.map((r, i) => {
            const isCode =
              r.reference.file_path.endsWith(".py") || r.reference.file_path.endsWith(".ts");
            const resultId = `${r.chunk_id}-${i}`;

            return (
              <article
                key={resultId}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
                        isCode ? "bg-violet-50 text-violet-600" : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {isCode ? <Code2 size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                        {r.title}
                      </h2>
                      <p className="mt-0.5 font-mono text-xs text-slate-500 truncate">
                        {r.reference.file_path}
                      </p>
                    </div>
                  </div>

                  {/* Similarity Pill */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-700 border border-emerald-200">
                      {(r.score * 100).toFixed(1)}% Match
                    </span>
                    <button
                      onClick={() => handleCopy(r.content, resultId)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      title="Copy chunk content"
                    >
                      {copiedId === resultId ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Content snippet */}
                <div
                  className={`mt-4 rounded-xl p-3.5 text-xs leading-relaxed ${
                    isCode
                      ? "bg-slate-900 text-slate-200 font-mono"
                      : "bg-slate-50/70 text-slate-700 font-sans border border-slate-100"
                  }`}
                >
                  <pre className="whitespace-pre-wrap">{r.content}</pre>
                </div>

                {/* Footer Actions */}
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Chunk ID: #{r.chunk_id}
                  </span>
                  <button
                    onClick={() => {
                      navigate("/chat");
                    }}
                    className="flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <span>Ask AI about this match</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Copy,
  Check,
  Layers,
  FileCode,
  Eye,
} from "lucide-react";
import {
  getDocument,
  getDocuments,
  getDocumentChunks,
  type DocumentDetails,
  type DocumentItem,
} from "../../services/api/documents";

export default function Documents() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selected, setSelected] = useState<DocumentDetails | null>(null);
  const [chunks, setChunks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"content" | "chunks">("content");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const docs = await getDocuments();
      setDocuments(docs || []);
      if (docs && docs.length > 0 && !selected) {
        open(docs[0].id);
      }
    } catch (e: any) {
      console.error("Failed to load documents:", e);
      setError(e?.response?.data?.detail || "Unable to retrieve document vault.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const open = async (id: number) => {
    setLoadingDoc(true);
    setError("");
    try {
      const [doc, c] = await Promise.all([getDocument(id), getDocumentChunks(id)]);
      setSelected(doc);
      setChunks(c || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Unable to open document details.");
    } finally {
      setLoadingDoc(false);
    }
  };

  const handleCopyContent = () => {
    if (!selected) return;
    navigator.clipboard.writeText(selected.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch =
        doc.title.toLowerCase().includes(search.toLowerCase()) ||
        doc.file_path.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        statusFilter === "all" || doc.processing_status?.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });
  }, [documents, search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Document & Knowledge Vault
              </h1>
              <p className="text-xs text-slate-500">
                Authorized enterprise documentation, chunking pipelines, and vector embeddings.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={load}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition active:scale-95"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
          <span>Refresh Vault</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 shadow-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-600 font-bold hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* ---------------- Split View: List & Reader ---------------- */}
      <div className="grid gap-6 lg:grid-cols-12 min-h-[600px]">
        {/* Left: Document Browser (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-4 border-b border-slate-200/80 space-y-2.5 bg-slate-50/50">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents by name or path..."
                className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-slate-400 font-medium">Status:</span>
              {["all", "completed", "pending", "failed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-lg px-2.5 py-0.5 font-semibold capitalize transition ${
                    statusFilter === st
                      ? "bg-indigo-600 text-white shadow-2xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Document Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 size={20} className="animate-spin text-indigo-600" />
                <span className="text-xs">Loading documents...</span>
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <FileText size={28} className="text-slate-300 mb-2" />
                <p className="text-xs">No documents match the current filter.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selected?.id === doc.id;
                const isCompleted = doc.processing_status?.toLowerCase() === "completed";
                const isCode = doc.file_path?.endsWith(".py") || doc.file_path?.endsWith(".ts");

                return (
                  <button
                    key={doc.id}
                    onClick={() => open(doc.id)}
                    className={`group flex w-full items-start gap-3 rounded-xl p-3.5 text-left transition-all ${
                      isSelected
                        ? "bg-indigo-50/70 border border-indigo-200 shadow-xs"
                        : "border border-slate-100 bg-white hover:bg-slate-50/80 hover:border-slate-200"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      }`}
                    >
                      {isCode ? <FileCode size={18} /> : <FileText size={18} />}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {doc.title || "Untitled Document"}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {doc.processing_status || "queued"}
                        </span>
                      </div>

                      <p className="mt-1 font-mono text-[10px] text-slate-400 truncate">{doc.file_path}</p>

                      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Doc #{doc.id}</span>
                        <span>•</span>
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Document Reader & Chunk Viewer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {!selected ? (
            <div className="flex h-full flex-col items-center justify-center py-24 text-center text-slate-400">
              <Eye size={36} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-bold text-slate-700">Select a Document</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                Choose any indexed document from the vault to inspect its raw content and semantic chunk breakdown.
              </p>
            </div>
          ) : (
            <>
              {/* Document Header */}
              <div className="border-b border-slate-200 p-5 bg-slate-50/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                        ID #{selected.id}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                        {selected.processing_status}
                      </span>
                    </div>
                    <h2 className="mt-1 text-base font-bold text-slate-900">{selected.title}</h2>
                    <p className="mt-0.5 font-mono text-xs text-slate-500 break-all">{selected.file_path}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyContent}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                      title="Copy content"
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex gap-1 border-t border-slate-200/80 pt-3">
                  <button
                    onClick={() => setActiveTab("content")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      activeTab === "content"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <FileText size={14} />
                    <span>Document Content</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("chunks")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      activeTab === "chunks"
                        ? "bg-indigo-600 text-white shadow-2xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Layers size={14} />
                    <span>Indexed Chunks ({chunks.length})</span>
                  </button>
                </div>
              </div>

              {/* Reader Body */}
              <div className="flex-1 overflow-y-auto p-5">
                {loadingDoc ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                    <Loader2 size={22} className="animate-spin text-indigo-600" />
                    <span className="text-xs">Parsing document...</span>
                  </div>
                ) : activeTab === "content" ? (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-5 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-text">
                    {selected.content}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chunks.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">
                        No semantic chunks indexed for this document.
                      </div>
                    ) : (
                      chunks.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-indigo-200 transition"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                            <span className="rounded bg-indigo-50 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-700">
                              Chunk #{c.chunk_index}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Qdrant Vector Indexed
                            </span>
                          </div>
                          <p className="font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                            {c.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

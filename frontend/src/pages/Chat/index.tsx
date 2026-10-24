import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Bot,
  Send,
  User,
  Loader2,
  Plus,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Code2,
  FileText,
  Search,
  Layers,
  Database,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { sendAIMessage, type AIReference } from "../../services/aiService";
import {
  getConversations,
  getConversationMessages,
  type Conversation,
} from "../../services/api/conversation";
import MarkdownContent from "../../components/common/MarkdownContent";

interface ChatMessage {
  id?: string;
  role: "user" | "assistant";
  content: string;
  references?: AIReference[];
  timestamp?: string;
}

export default function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(() => {
    const stored = localStorage.getItem("conversation_id");
    return stored ? Number(stored) : null;
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [searchHistory, setSearchHistory] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<"hybrid" | "codemind" | "docs">("hybrid");

  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [error, setError] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedRefs, setExpandedRefs] = useState<Record<number, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    try {
      const data = await getConversations();
      setConversations(data || []);
      if (conversationId) {
        const exists = data.some((c) => c.id === conversationId);
        if (!exists) {
          localStorage.removeItem("conversation_id");
          setConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversation = async (id: number) => {
    setLoadingHistory(true);
    setError("");
    try {
      const history = await getConversationMessages(id);
      setMessages(
        history.map((msg) => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }))
      );
      setConversationId(id);
      localStorage.setItem("conversation_id", String(id));
    } catch (err: any) {
      console.error("Failed to load conversation:", err);
      setError(err?.response?.data?.detail || "Failed to load conversation history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleNewConversation = () => {
    localStorage.removeItem("conversation_id");
    setConversationId(null);
    setMessages([]);
    setInput("");
    setError("");
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleRefs = (index: number) => {
    setExpandedRefs((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const prompt = input.trim();
    if (!prompt || loading) return;

    setError("");
    const userMsg: ChatMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendAIMessage({
        message: prompt,
        conversation_id: conversationId,
      });

      setConversationId(response.conversation_id);
      localStorage.setItem("conversation_id", String(response.conversation_id));

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: response.answer,
        references: response.references || [],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      await loadConversations();
    } catch (err: any) {
      console.error("AI Assistant request error:", err);
      const detail = err?.response?.data?.detail;
      setError(detail || "Failed to retrieve AI response. Please ensure backend services are running.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromptCard = (text: string) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || "New conversation").toLowerCase().includes(searchHistory.toLowerCase())
  );

  const starterPrompts = [
    {
      title: "Payment & Refund Rules",
      desc: "Explain the AST business rules and refund limitations in PayFlow",
      tag: "CodeMind AST",
      icon: Code2,
      query: "Explain the payment and refund flow in PayFlow and what business rules enforce refund limits.",
    },
    {
      title: "Neo4j Knowledge Entities",
      desc: "List customer and invoice relationships mapped in the graph",
      tag: "Knowledge Graph",
      icon: Database,
      query: "What entities and relationships connect Customer, Payment, and Invoice in our knowledge graph?",
    },
    {
      title: "System Architecture",
      desc: "Summarize the microservices and FastAPI architecture layers",
      tag: "Architecture",
      icon: Layers,
      query: "Provide a high-level summary of the system architecture, connectors, and database backends.",
    },
    {
      title: "Security & RBAC",
      desc: "How are project-scoped authorization tokens verified?",
      tag: "Security",
      icon: ShieldCheck,
      query: "How does project-scoped authorization and JWT authentication protect sensitive documents?",
    },
  ];

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* ---------------- Conversation Sidebar ---------------- */}
      <aside className="hidden w-80 shrink-0 flex-col border-r border-slate-200/80 bg-slate-50/70 lg:flex">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Conversations</h2>
              <span className="text-[11px] text-slate-500 font-medium">
                {conversations.length} sessions stored
              </span>
            </div>
          </div>
          <button
            onClick={handleNewConversation}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs border border-slate-200/80 hover:bg-slate-50 hover:text-indigo-600 transition active:scale-95"
            title="Start new conversation"
          >
            <Plus size={14} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Chats */}
        <div className="p-3 border-b border-slate-200/60">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              placeholder="Search chat history..."
              className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 size={20} className="animate-spin text-indigo-500" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="px-4 py-12 text-center text-xs text-slate-400">
              {searchHistory ? "No matching chats found." : "No saved chats yet. Start asking questions!"}
            </div>
          ) : (
            filteredConversations.map((c) => {
              const active = c.id === conversationId;
              return (
                <button
                  key={c.id}
                  onClick={() => loadConversation(c.id)}
                  className={`group flex w-full items-start gap-3 rounded-xl p-3 text-left transition-all ${
                    active
                      ? "bg-white text-indigo-700 shadow-xs border border-indigo-100 font-medium"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${
                      active ? "bg-indigo-50 text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  >
                    <MessageSquare size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold leading-tight">
                      {c.title || "New Knowledge Query"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {active && <span className="h-2 w-2 rounded-full bg-indigo-600 self-center" />}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ---------------- Main Chat Area ---------------- */}
      <div className="flex min-w-0 flex-1 flex-col bg-slate-50/30">
        {/* Top Chat Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/20">
              <Bot size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900">TechNova Intelligence Copilot</h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Gemini Flash 2.5
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Grounded in Neo4j Knowledge Graph, Qdrant Vector Indexes & AST Analysis
              </p>
            </div>
          </div>

          {/* Engine Selector Pills */}
          <div className="hidden sm:flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200/80">
            <button
              onClick={() => setSelectedEngine("hybrid")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedEngine === "hybrid"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Zap size={12} className={selectedEngine === "hybrid" ? "text-indigo-600" : "text-slate-400"} />
              <span>Hybrid GraphRAG</span>
            </button>
            <button
              onClick={() => setSelectedEngine("codemind")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedEngine === "codemind"
                  ? "bg-white text-indigo-700 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Code2 size={12} className={selectedEngine === "codemind" ? "text-indigo-600" : "text-slate-400"} />
              <span>CodeMind AST</span>
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800 shadow-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-rose-500 hover:text-rose-700 text-xs">
                Dismiss
              </button>
            </div>
          )}

          {loadingHistory ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 size={24} className="animate-spin text-indigo-500" />
              <p className="text-xs font-medium">Retrieving conversation records...</p>
            </div>
          ) : messages.length === 0 ? (
            /* Empty State Hero & Starter Prompts */
            <div className="flex h-full flex-col items-center justify-center max-w-2xl mx-auto text-center py-8">
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-xl shadow-indigo-500/25">
                <Sparkles size={32} />
                <div className="absolute -inset-1 rounded-2xl bg-indigo-500/20 blur-md -z-10" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                What would you like to explore today?
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-md">
                Ask anything about organizational repositories, API designs, AST code relationships, or business policies.
              </p>

              {/* Quick Starter Cards */}
              <div className="mt-8 grid w-full grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {starterPrompts.map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handlePromptCard(card.query)}
                      className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5 active:scale-98"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                          <Icon size={15} />
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                          {card.tag}
                        </span>
                      </div>
                      <div className="mt-3">
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {card.title}
                        </h3>
                        <p className="mt-1 text-[11px] text-slate-500 leading-snug">{card.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Render Messages */
            messages.map((msg, index) => {
              const isUser = msg.role === "user";
              const isAssistant = msg.role === "assistant";
              const hasRefs = isAssistant && msg.references && msg.references.length > 0;
              const isRefsOpen = expandedRefs[index] ?? false;

              return (
                <div
                  key={index}
                  className={`flex gap-3.5 max-w-4xl ${
                    isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-xs ${
                      isUser
                        ? "bg-slate-900 text-white"
                        : "bg-gradient-to-tr from-indigo-600 to-violet-600 text-white"
                    }`}
                  >
                    {isUser ? <User size={16} /> : <Bot size={18} />}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`flex flex-col min-w-0 max-w-2xl ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    {/* Header info */}
                    <div className="mb-1 flex items-center gap-2 px-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-700">
                        {isUser ? "You" : "TechNova AI"}
                      </span>
                      <span>•</span>
                      <span>{msg.timestamp || "Just now"}</span>
                    </div>

                    {/* Content Card */}
                    <div
                      className={`relative rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? "bg-indigo-600 text-white shadow-indigo-600/10 font-normal"
                          : "border border-slate-200/90 bg-white text-slate-800"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="prose prose-xs max-w-none text-slate-800">
                          <MarkdownContent content={msg.content} />
                        </div>
                      )}

                      {/* Assistant actions: Copy */}
                      {isAssistant && (
                        <div className="mt-3 flex items-center justify-end gap-2 border-t border-slate-100 pt-2 text-slate-400">
                          <button
                            onClick={() => handleCopy(msg.content, index)}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium hover:bg-slate-100 hover:text-slate-700 transition"
                            title="Copy answer"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check size={12} className="text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Citations & References Drawer */}
                    {hasRefs && (
                      <div className="mt-2 w-full rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 transition">
                        <button
                          onClick={() => toggleRefs(index)}
                          className="flex w-full items-center justify-between text-xs font-bold text-indigo-900"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600 text-white text-[10px]">
                              {msg.references!.length}
                            </span>
                            <span>Grounded Knowledge References</span>
                          </div>
                          {isRefsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {isRefsOpen && (
                          <div className="mt-2 space-y-1.5 border-t border-indigo-100 pt-2">
                            {msg.references!.map((ref, rIdx) => (
                              <div
                                key={rIdx}
                                className="flex items-start justify-between rounded-lg bg-white p-2 text-[11px] shadow-2xs border border-indigo-100/80"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                                    <FileText size={12} className="text-indigo-600 shrink-0" />
                                    <span className="truncate">{ref.file_path || "Knowledge Document"}</span>
                                  </div>
                                  {ref.symbol_name && (
                                    <div className="mt-0.5 text-[10px] text-slate-500 font-mono">
                                      Symbol: <span className="text-indigo-600">{ref.symbol_name}</span>
                                    </div>
                                  )}
                                  {ref.snippet && (
                                    <p className="mt-1 line-clamp-2 rounded bg-slate-50 p-1 text-[10px] text-slate-600 font-mono">
                                      {ref.snippet}
                                    </p>
                                  )}
                                </div>
                                {ref.score !== undefined && (
                                  <span className="ml-2 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                                    {(ref.score * 100).toFixed(0)}%
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-xs">
                <Bot size={18} />
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Traversing AST graph & synthesizing answer...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ---------------- Floating Input Bar ---------------- */}
        <div className="p-4 bg-white/95 border-t border-slate-200/80 backdrop-blur-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="relative flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-2 shadow-xs focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask anything about PayFlow, business rules, or codebase architecture (Enter to send)..."
              className="max-h-32 min-h-[38px] w-full resize-none bg-transparent px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>
          <div className="mt-1.5 flex items-center justify-between px-2 text-[11px] text-slate-400">
            <span>Press <kbd className="rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[10px]">Enter</kbd> to send, <kbd className="rounded border border-slate-200 bg-slate-100 px-1 font-mono text-[10px]">Shift+Enter</kbd> for newline</span>
            <span className="text-slate-400">Project: <span className="font-semibold text-slate-600">TechNova PayFlow</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  ChevronDown,
  FileText,
  Globe,
  Video,
  PenTool,
  Loader2,
  Copy,
  Check,
  Paperclip,
  Bot,
  User,
} from "lucide-react";
import { chatApi, type ChatMessage } from "../api/chatApi";

interface ChatPanelProps {
  chatId?: string;
  onOpenUploadModal: (tab: "file" | "web" | "youtube" | "ocr") => void;
  onJumpToPage: (page: number) => void;
  className?: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    model: "openai",
    content: `Hello! I have analyzed **Q3_2023_Business_Strategy_Report.pdf** (32 pages).\n\nYou can query financial figures, compare regional growth, or upload handwritten meeting notes and YouTube lecture videos.`,
  },
  {
    role: "user",
    content:
      "What was the overall regional revenue growth for Q3 and which regions led?",
  },
  {
    role: "assistant",
    model: "openai",
    content: `According to the executive summary:\n\n* **Consolidated Growth**: Overall revenue expanded by **+14.2% YoY**.\n* **North America**: Generated **$345M** (+11.5% YoY), contributing 42.0% of total revenue.\n* **Europe (EMEA)**: Generated **$280M** with the highest growth velocity at **+16.8% YoY**.\n* **Asia-Pacific**: Generated **$195M** with rapid **+22.1% YoY** expansion.`,
    citations: [
      {
        documentId: "doc-1",
        page: 4,
        snippet: "Our key market segments show significant growth at 14.2% YoY",
      },
    ],
  },
];

const MODEL_OPTIONS = [
  { id: "openai", label: "GPT-4o", badge: "Fast" },
  { id: "gemini", label: "Gemini 2.5", badge: "Pro" },
  { id: "claude", label: "Claude 3.5", badge: "Advanced" },
];

interface MessageBubbleProps {
  msg: ChatMessage;
  onCitationClick: (page: number) => void;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n\* /g, "</p><ul><li>")
    .replace(/\n/g, "<br/>");
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg,
  onCitationClick,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex gap-3 group ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: isUser
            ? "var(--color-brand-900)"
            : "var(--color-surface-2)",
          border: `1px solid ${isUser ? "rgba(99,102,241,0.3)" : "var(--color-border-subtle)"}`,
        }}
      >
        {isUser ? (
          <User size={12} style={{ color: "var(--color-brand-300)" }} />
        ) : (
          <Bot size={12} style={{ color: "var(--color-text-secondary)" }} />
        )}
      </div>

      {/* Message */}
      <div
        className={`flex flex-col gap-1.5 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}
      >
        {/* Model badge for assistant */}
        {!isUser && msg.model && (
          <span
            className="text-2xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--color-text-disabled)" }}
          >
            {MODEL_OPTIONS.find((m) => m.id === msg.model)?.label ?? msg.model}
          </span>
        )}

        {/* Bubble */}
        <div
          className="rounded-md text-sm leading-relaxed"
          style={{
            padding: "10px 14px",
            background: isUser
              ? "var(--color-brand-900)"
              : "var(--color-surface-1)",
            border: `1px solid ${isUser ? "rgba(99,102,241,0.2)" : "var(--color-border-subtle)"}`,
            color: "var(--color-text-primary)",
          }}
        >
          {isUser ? (
            <p>{msg.content}</p>
          ) : (
            <div
              className="prose-xs"
              dangerouslySetInnerHTML={{
                __html: `<p>${renderMarkdown(msg.content)}</p>`,
              }}
              style={{ lineHeight: "1.7" }}
            />
          )}
        </div>

        {/* Citations */}
        {msg.citations && msg.citations.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-2xs font-semibold"
              style={{ color: "var(--color-text-disabled)" }}
            >
              Sources
            </span>
            {msg.citations.map((c, i) => (
              <button
                key={i}
                onClick={() => onCitationClick(c.page ?? 1)}
                className="citation-chip"
                title={c.snippet}
              >
                <FileText size={10} />
                <span>p.{c.page}</span>
              </button>
            ))}
          </div>
        )}

        {/* Copy button (assistant only) */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-2xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: "var(--color-text-muted)" }}
          >
            {copied ? (
              <>
                <Check size={11} style={{ color: "var(--color-success)" }} />{" "}
                Copied
              </>
            ) : (
              <>
                <Copy size={11} /> Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export const ChatPanel: React.FC<ChatPanelProps> = ({
  chatId = "sample-chat-1",
  onOpenUploadModal,
  onJumpToPage,
  className = "",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const result = await chatApi.sendQuery(
        chatId!,
        text,
        selectedModel as "openai" | "gemini-text",
      );
      const reply: ChatMessage = {
        role: "assistant",
        model: result.data.model,
        content: result.data.response,
        citations: result.data.citations,
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          model: selectedModel as ChatMessage["model"],
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeModel = MODEL_OPTIONS.find((m) => m.id === selectedModel)!;

  return (
    <div
      className={`flex flex-col h-full ${className}`}
      style={{ background: "var(--color-canvas)" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 h-11 shrink-0"
        style={{
          background: "var(--color-base)",
          borderBottom: "1px solid var(--color-border-hairline)",
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={13} style={{ color: "var(--color-brand-400)" }} />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            AI Assistant
          </span>
        </div>

        {/* Model selector */}
        <div className="relative">
          <button
            onClick={() => setShowModelMenu((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-xs font-semibold transition-all"
            style={{
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border-subtle)",
              color: "var(--color-text-secondary)",
            }}
            id="btn-model-selector"
          >
            {activeModel.label}
            <ChevronDown
              size={11}
              className={`transition-transform ${showModelMenu ? "rotate-180" : ""}`}
            />
          </button>

          {showModelMenu && (
            <>
              <div
                className="fixed inset-0 z-raised"
                onClick={() => setShowModelMenu(false)}
              />
              <div
                className="absolute right-0 top-full mt-1 z-overlay rounded-md overflow-hidden animate-scale-in"
                style={{
                  background: "var(--color-surface-0)",
                  border: "1px solid var(--color-border-default)",
                  boxShadow: "var(--shadow-lg)",
                  minWidth: "180px",
                }}
              >
                {MODEL_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setShowModelMenu(false);
                    }}
                    className="flex items-center justify-between w-full px-3 py-2.5 text-sm transition-colors"
                    style={{
                      background:
                        m.id === selectedModel
                          ? "var(--color-surface-2)"
                          : "transparent",
                      color:
                        m.id === selectedModel
                          ? "var(--color-text-primary)"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    <span className="font-medium">{m.label}</span>
                    <span
                      className="text-2xs font-semibold px-1.5 py-0.5 rounded-full"
                      style={{
                        background:
                          m.id === selectedModel
                            ? "rgba(99,102,241,0.15)"
                            : "var(--color-surface-2)",
                        color:
                          m.id === selectedModel
                            ? "var(--color-brand-300)"
                            : "var(--color-text-muted)",
                      }}
                    >
                      {m.badge}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Message Feed ── */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "16px" }}>
        <div className="space-y-5 max-w-[640px] mx-auto">
          {messages.map((msg, i) => (
            <div key={i} className="animate-slide-up">
              <MessageBubble msg={msg} onCitationClick={onJumpToPage} />
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--color-surface-2)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                <Bot
                  size={12}
                  style={{ color: "var(--color-text-secondary)" }}
                />
              </div>
              <div
                className="rounded-md px-4 py-2.5"
                style={{
                  background: "var(--color-surface-1)",
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                <div className="flex items-center gap-1.5">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-pulse-slow"
                      style={{
                        background: "var(--color-brand-400)",
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* ── Input Area ── */}
      <div
        className="px-4 pb-4 pt-3 shrink-0"
        style={{ borderTop: "1px solid var(--color-border-hairline)" }}
      >
        {/* Quick action chips */}
        <div className="flex items-center gap-2 mb-2.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            {
              icon: <FileText size={11} />,
              label: "Upload PDF",
              tab: "file" as const,
            },
            {
              icon: <Globe size={11} />,
              label: "Scrape URL",
              tab: "web" as const,
            },
            {
              icon: <Video size={11} />,
              label: "YouTube",
              tab: "youtube" as const,
            },
            {
              icon: <PenTool size={11} />,
              label: "Handwriting OCR",
              tab: "ocr" as const,
            },
          ].map((action) => (
            <button
              key={action.tab}
              onClick={() => onOpenUploadModal(action.tab)}
              className="flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border-subtle)",
                color: "var(--color-text-secondary)",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>
                {action.icon}
              </span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Input box */}
        <div
          className="flex items-end gap-2 rounded-md"
          style={{
            background: "var(--color-input)",
            border: "1px solid var(--color-border-default)",
            padding: "8px 8px 8px 12px",
          }}
        >
          <button
            className="toolbar-btn shrink-0 mb-0.5"
            onClick={() => onOpenUploadModal("file")}
            title="Attach file"
          >
            <Paperclip size={15} />
          </button>

          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Ask about your documents…"
            className="flex-1 bg-transparent border-none outline-none text-sm resize-none"
            style={{
              color: "var(--color-text-primary)",
              minHeight: "24px",
              maxHeight: "120px",
              lineHeight: "1.6",
            }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="shrink-0 w-8 h-8 rounded-sm flex items-center justify-center transition-all"
            style={{
              background:
                input.trim() && !loading
                  ? "var(--color-brand-600)"
                  : "var(--color-surface-2)",
              color:
                input.trim() && !loading
                  ? "#fff"
                  : "var(--color-text-disabled)",
              boxShadow:
                input.trim() && !loading ? "var(--shadow-brand-sm)" : "none",
            }}
            id="btn-send-message"
          >
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
          </button>
        </div>

        <p
          className="text-center text-2xs mt-2"
          style={{ color: "var(--color-text-disabled)" }}
        >
          DocTalker may make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatPanel;

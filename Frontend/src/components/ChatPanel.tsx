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
  UploadCloud,
} from "lucide-react";
import { chatApi, type ChatMessage } from "../api/chatApi";

interface ChatPanelProps {
  chatId?: string | null;
  onOpenUploadModal: (tab: "file" | "web" | "youtube" | "ocr") => void;
  onJumpToPage: (page: number) => void;
  className?: string;
}

const MODEL_OPTIONS = [
  { id: "openai", label: "GPT-4o", badge: "Fast" },
  { id: "gemini-text", label: "Gemini 2.5", badge: "Smart" },
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
          <Bot size={12} style={{ color: "var(--color-brand-400)" }} />
        )}
      </div>

      {/* Bubble Content */}
      <div
        className={`flex flex-col gap-1.5 max-w-[82%] ${isUser ? "items-end" : "items-start"}`}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-2xs font-semibold"
            style={{ color: "var(--color-text-muted)" }}
          >
            {isUser ? "You" : "DocTalker AI"}
          </span>
          {msg.model && !isUser && (
            <span
              className="text-2xs font-mono px-1.5 py-0.5 rounded-full"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-text-secondary)",
              }}
            >
              {msg.model}
            </span>
          )}
        </div>

        {/* Text */}
        <div
          className={`rounded-md text-xs leading-relaxed ${
            isUser ? "px-3.5 py-2.5 text-white" : "px-4 py-3"
          }`}
          style={{
            background: isUser
              ? "var(--color-brand-600)"
              : "var(--color-surface-1)",
            border: isUser ? "none" : "1px solid var(--color-border-subtle)",
            color: isUser ? "#ffffff" : "var(--color-text-primary)",
            boxShadow: isUser
              ? "var(--shadow-brand-sm)"
              : "var(--shadow-surface-card)",
          }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div
              className="prose prose-invert prose-xs max-w-none [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2 [&>strong]:text-indigo-300"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
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
  chatId,
  onOpenUploadModal,
  onJumpToPage,
  className = "",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai");
  const [showModelMenu, setShowModelMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat messages when active chatId changes
  useEffect(() => {
    if (!chatId) {
      setMessages([]);
      return;
    }

    let isCurrent = true;
    setLoadingHistory(true);

    chatApi
      .getChat(chatId)
      .then((res) => {
        if (!isCurrent) return;
        if (res.chat && res.chat.messages) {
          const formatted: ChatMessage[] = res.chat.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            model: m.model,
            createdAt: m.createdAt,
            citations: m.citations,
          }));
          setMessages(formatted);
        } else {
          setMessages([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
      })
      .finally(() => {
        if (isCurrent) setLoadingHistory(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendPrompt = (promptText: string) => {
    setInput(promptText);
    inputRef.current?.focus();
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (!chatId) {
      onOpenUploadModal("file");
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await chatApi.streamQuery(
        chatId,
        text,
        selectedModel as "openai" | "gemini-text",
      );

      const reader = response.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      if (!reader) throw new Error("No stream reader available");

      let botMessageIndex = -1;
      let buffer = "";

      // Add a placeholder message for the assistant
      setMessages((prev) => {
        botMessageIndex = prev.length;
        return [
          ...prev,
          {
            role: "assistant",
            model: selectedModel as ChatMessage["model"],
            content: "",
            citations: [],
          },
        ];
      });

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() || "";

          for (const part of parts) {
            if (part.startsWith("event: metadata")) {
              const dataLine = part
                .split("\n")
                .find((l) => l.startsWith("data: "));
              if (dataLine) {
                try {
                  const data = JSON.parse(dataLine.replace("data: ", ""));
                  if (data.topChunks) {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      if (newMessages[botMessageIndex]) {
                        newMessages[botMessageIndex].citations =
                          data.topChunks.map((c: any, idx: number) => ({
                            documentId: `doc-${idx}`,
                            page: c.pageNumber || 1,
                            snippet: c.rawText,
                          }));
                      }
                      return newMessages;
                    });
                  }
                } catch {
                  // ignore JSON parse error
                }
              }
            } else if (part.startsWith("event: end")) {
              done = true;
            } else if (part.startsWith("data: ")) {
              const dataStr = part.replace("data: ", "");
              if (dataStr === "[DONE]") {
                done = true;
                continue;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.chunk) {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    if (newMessages[botMessageIndex]) {
                      newMessages[botMessageIndex].content += data.chunk;
                    }
                    return newMessages;
                  });
                }
              } catch {
                // Ignore parse errors on partial chunks
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          model: selectedModel as ChatMessage["model"],
          content:
            "Sorry, something went wrong while generating response. Please try again.",
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

  const activeModel =
    MODEL_OPTIONS.find((m) => m.id === selectedModel) || MODEL_OPTIONS[0];

  return (
    <div
      className={`flex flex-col h-full select-none ${className}`}
      style={{
        background: "var(--color-surface-0)",
        borderLeft: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        className="flex items-center justify-between px-4 h-12 shrink-0"
        style={{
          borderBottom: "1px solid var(--color-border-hairline)",
          background: "var(--color-base)",
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles size={13} style={{ color: "var(--color-brand-400)" }} />
          <span
            className="text-xs font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            DocTalker AI Assistant
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
        {loadingHistory ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
            <p className="text-xs text-slate-400">
              Loading conversation history...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
              <Sparkles size={22} />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">
              {chatId
                ? "Ask questions about this document"
                : "No document selected"}
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              {chatId
                ? "Our AI indexes every sentence with vector embeddings for pinpoint citations and accurate answers."
                : "Upload a PDF, paste a website or YouTube URL, or import handwritten notes to begin chatting."}
            </p>

            {chatId ? (
              <div className="w-full mt-6 space-y-2">
                <span className="text-[11px] font-medium text-slate-500 block uppercase tracking-wider">
                  Suggested Questions
                </span>
                {[
                  "Summarize the key points of this document",
                  "What are the main actionable takeaways?",
                  "Extract any metrics, tables, and important dates",
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(prompt)}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Send
                      size={12}
                      className="opacity-0 group-hover:opacity-100 text-indigo-400 transition-opacity shrink-0 ml-2"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => onOpenUploadModal("file")}
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
              >
                <UploadCloud size={14} />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-5 max-w-[640px] mx-auto">
            {messages.map((msg, i) => (
              <div key={i} className="animate-slide-up">
                <MessageBubble msg={msg} onCitationClick={onJumpToPage} />
              </div>
            ))}

            {/* Streaming / thinking indicator */}
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
        )}
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
            placeholder={
              chatId
                ? "Ask about this document… (Enter to send)"
                : "Upload or select a document to ask questions…"
            }
            className="flex-1 bg-transparent resize-none border-none outline-none text-xs leading-relaxed"
            style={{
              color: "var(--color-text-primary)",
              maxHeight: "120px",
              minHeight: "20px",
            }}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="btn-primary shrink-0 p-1.5 rounded-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            id="btn-send-message"
            title="Send message"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Send size={13} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;

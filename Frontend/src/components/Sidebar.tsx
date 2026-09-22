import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  LogOut,
  X,
  Search,
  Settings,
  ChevronRight,
  Crown,
  Zap,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface ChatItem {
  id: string;
  chatName: string;
}

interface SidebarProps {
  chats: ChatItem[];
  chatsLoading?: boolean;
  activeChatId: string | null;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onOpenPricing?: () => void;
  onOpenUpload?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  chatsLoading = false,
  activeChatId,
  isMobileOpen = false,
  onCloseMobile,
  onSelectChat,
  onNewChat,
  onOpenPricing,
  onOpenUpload,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredChats = chats.filter((c) =>
    c.chatName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Real quota from user object
  const usedQueries = user?.queryRequest ?? 0;
  const totalQueries = user?.queryMax ?? 50;
  const quotaPct = Math.round((usedQueries / totalQueries) * 100);

  const content = (
    <aside
      className="flex flex-col h-full select-none"
      style={{
        width: "260px",
        background: "var(--color-base)",
        borderRight: "1px solid var(--color-border-subtle)",
      }}
    >
      {/* ── Brand Header ── */}
      <div
        className="flex items-center justify-between px-4 h-14 shrink-0"
        style={{ borderBottom: "1px solid var(--color-border-hairline)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-sm flex items-center justify-center font-bold text-xs text-white"
            style={{
              background: "var(--color-brand-600)",
              boxShadow: "var(--shadow-brand-sm)",
            }}
          >
            DT
          </div>
          <span
            className="font-bold text-sm tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            DocTalker
          </span>
        </div>

        {onCloseMobile && (
          <button onClick={onCloseMobile} className="toolbar-btn lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── New Chat / Upload Buttons ── */}
      <div className="px-3 pt-3 pb-2 shrink-0 space-y-1.5">
        <button
          onClick={() => {
            onNewChat();
            onCloseMobile?.();
          }}
          className="btn btn-primary btn-md w-full"
          id="btn-new-chat"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>New Conversation</span>
        </button>
        {onOpenUpload && (
          <button
            onClick={() => {
              onOpenUpload();
              onCloseMobile?.();
            }}
            className="btn btn-secondary btn-sm w-full"
          >
            <UploadCloud size={13} />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* ── Search ── */}
      <div className="px-3 pb-3 shrink-0">
        <div className="input-icon gap-2">
          <Search
            size={13}
            style={{ color: "var(--color-text-muted)" }}
            className="shrink-0"
          />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
          />
        </div>
      </div>

      <div
        className="text-label px-4 pb-2 shrink-0"
        style={{ letterSpacing: "0.08em" }}
      >
        Recent Chats
      </div>

      {/* ── Chat List ── */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {chatsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2
              size={20}
              className="animate-spin"
              style={{ color: "var(--color-text-muted)" }}
            />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <MessageSquare
              size={24}
              className="mx-auto mb-2"
              style={{ color: "var(--color-text-disabled)" }}
            />
            <p className="text-caption text-xs">
              {searchQuery ? "No matching chats" : "No conversations yet"}
            </p>
            {!searchQuery && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-disabled)" }}
              >
                Upload a document to get started
              </p>
            )}
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            return (
              <button
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  onCloseMobile?.();
                }}
                className={`nav-item w-full text-left ${isActive ? "active" : ""}`}
              >
                <MessageSquare
                  size={14}
                  className="shrink-0"
                  style={{
                    color: isActive
                      ? "var(--color-brand-400)"
                      : "var(--color-text-muted)",
                  }}
                />
                <span className="flex-1 truncate text-sm">{chat.chatName}</span>
                {isActive && (
                  <ChevronRight
                    size={12}
                    style={{ color: "var(--color-text-muted)" }}
                    className="shrink-0"
                  />
                )}
              </button>
            );
          })
        )}
      </nav>

      {/* ── Footer ── */}
      <div
        className="px-3 py-3 shrink-0 space-y-3"
        style={{ borderTop: "1px solid var(--color-border-hairline)" }}
      >
        {/* Quota Card */}
        <div
          className="rounded-md p-3 space-y-2"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Daily Queries
            </span>
            <span
              className="text-xs font-bold"
              style={{ color: "var(--color-brand-400)" }}
            >
              {usedQueries}/{totalQueries}
            </span>
          </div>

          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "var(--color-surface-2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(quotaPct, 100)}%`,
                background:
                  quotaPct > 80
                    ? "var(--color-danger)"
                    : "var(--color-brand-500)",
              }}
            />
          </div>

          <button
            onClick={onOpenPricing}
            className="btn btn-secondary btn-sm w-full text-xs"
          >
            <Zap size={12} style={{ color: "var(--color-brand-400)" }} />
            <span>Upgrade Plan</span>
          </button>
        </div>

        {/* User Profile Row */}
        <div className="flex items-center gap-2.5 px-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm"
            style={{
              background: "var(--color-brand-900)",
              border: "1px solid rgba(99,102,241,0.3)",
              color: "var(--color-brand-300)",
            }}
          >
            {user?.firstName?.[0]?.toUpperCase() ?? "U"}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="text-sm font-semibold truncate"
              style={{ color: "var(--color-text-primary)" }}
            >
              {user
                ? `${user.firstName} ${user.lastName || ""}`.trim()
                : "Guest"}
            </div>
            <div className="flex items-center gap-1">
              <Crown size={10} style={{ color: "var(--color-warning)" }} />
              <span
                className="text-2xs font-semibold"
                style={{ color: "var(--color-warning)" }}
              >
                {user?.subscription === "free"
                  ? "Free Tier"
                  : (user?.subscription ?? "Free Tier")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            <button className="toolbar-btn" title="Settings">
              <Settings size={14} />
            </button>
            <button
              onClick={handleLogout}
              className="toolbar-btn"
              title="Log out"
              id="btn-logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop persistent */}
      <div className="hidden lg:flex shrink-0 h-full">{content}</div>

      {/* Mobile slide-over drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-modal flex">
          <div
            className="fixed inset-0 animate-fade-in"
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onCloseMobile}
          />
          <div
            className="relative flex h-full animate-slide-in-left"
            style={{ boxShadow: "var(--shadow-xl)" }}
          >
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

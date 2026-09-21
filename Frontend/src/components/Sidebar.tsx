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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  activeChatId: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onOpenPricing?: () => void;
}

const MOCK_CHATS = [
  {
    id: "1",
    title: "Q3 Business Strategy Report",
    time: "2m ago",
    active: true,
  },
  {
    id: "2",
    title: "Competitor Landscape Analysis",
    time: "1h ago",
    active: false,
  },
  {
    id: "3",
    title: "AI Engineering Whitepaper",
    time: "Yesterday",
    active: false,
  },
  {
    id: "4",
    title: "Market Research & Forecasts",
    time: "3d ago",
    active: false,
  },
  {
    id: "5",
    title: "Q4 Financial Projections",
    time: "Last week",
    active: false,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeChatId,
  isMobileOpen = false,
  onCloseMobile,
  onSelectChat,
  onNewChat,
  onOpenPricing,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredChats = MOCK_CHATS.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const usedQueries = 39;
  const totalQueries = 50;
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

        {/* Mobile close */}
        {onCloseMobile && (
          <button onClick={onCloseMobile} className="toolbar-btn lg:hidden">
            <X size={16} />
          </button>
        )}
      </div>

      {/* ── New Chat Button ── */}
      <div className="px-3 pt-3 pb-2 shrink-0">
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

      {/* ── Chat List ── */}
      <div
        className="text-label px-4 pb-2 shrink-0"
        style={{ letterSpacing: "0.08em" }}
      >
        Recent Chats
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {filteredChats.length === 0 ? (
          <p className="text-caption px-3 py-4 text-center">
            No conversations yet
          </p>
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
                <span className="flex-1 truncate text-sm">{chat.title}</span>
                {isActive ? (
                  <ChevronRight
                    size={12}
                    style={{ color: "var(--color-text-muted)" }}
                    className="shrink-0"
                  />
                ) : (
                  <span
                    className="text-2xs shrink-0"
                    style={{ color: "var(--color-text-disabled)" }}
                  >
                    {chat.time}
                  </span>
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

          {/* Progress bar */}
          <div
            className="h-1 rounded-full overflow-hidden"
            style={{ background: "var(--color-surface-2)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${quotaPct}%`,
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
          {/* Avatar */}
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
                {user?.isVerified ? "Pro Member" : "Free Tier"}
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
              style={
                {
                  "--tw-hover-text": "var(--color-danger)",
                } as React.CSSProperties
              }
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

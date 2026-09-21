import React from "react";
import { Menu, FileText, MessageSquare, Zap } from "lucide-react";

interface MobileHeaderProps {
  activeView: "document" | "chat";
  onToggleView: (view: "document" | "chat") => void;
  onOpenSidebar: () => void;
  onOpenPricing?: () => void;
  documentTitle?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeView,
  onToggleView,
  onOpenSidebar,
  onOpenPricing,
  documentTitle = "Document",
}) => {
  return (
    <header
      className="lg:hidden flex flex-col w-full shrink-0"
      style={{
        background: "var(--color-base)",
        borderBottom: "1px solid var(--color-border-hairline)",
        zIndex: 20,
      }}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between px-3 h-12">
        <button
          onClick={onOpenSidebar}
          className="toolbar-btn -ml-1"
          title="Open menu"
          id="btn-mobile-menu"
          style={{ width: "36px", height: "36px" }}
        >
          <Menu size={18} />
        </button>

        <div className="flex items-center gap-2 min-w-0 flex-1 mx-3">
          <div
            className="w-6 h-6 rounded-xs flex items-center justify-center text-white font-bold shrink-0"
            style={{
              background: "var(--color-brand-600)",
              fontSize: "9px",
            }}
          >
            DT
          </div>
          <span
            className="text-xs font-semibold truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {documentTitle}
          </span>
        </div>

        <button
          onClick={onOpenPricing}
          className="flex items-center gap-1.5 text-2xs font-semibold rounded-full shrink-0"
          style={{
            color: "var(--color-brand-300)",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            padding: "4px 10px",
          }}
        >
          <Zap size={10} />
          <span>Upgrade</span>
        </button>
      </div>

      {/* Segmented Tab Controller */}
      <div className="grid grid-cols-2 gap-1 px-3 pb-2">
        {[
          {
            view: "document" as const,
            icon: <FileText size={13} />,
            label: "Document",
          },
          {
            view: "chat" as const,
            icon: <MessageSquare size={13} />,
            label: "AI Assistant",
          },
        ].map((tab) => {
          const isActive = activeView === tab.view;
          return (
            <button
              key={tab.view}
              onClick={() => onToggleView(tab.view)}
              className="flex items-center justify-center gap-2 py-2 rounded-sm text-xs font-semibold transition-all"
              style={{
                background: isActive ? "var(--color-surface-2)" : "transparent",
                color: isActive
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
                border: isActive
                  ? "1px solid var(--color-border-default)"
                  : "1px solid transparent",
              }}
            >
              <span
                style={{
                  color: isActive ? "var(--color-brand-400)" : "inherit",
                }}
              >
                {tab.icon}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};

export default MobileHeader;

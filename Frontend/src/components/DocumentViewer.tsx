import React, { useState } from "react";
import {
  FileText,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  BookOpen,
  LayoutList,
  Maximize2,
} from "lucide-react";

interface DocumentViewerProps {
  documentTitle?: string;
  highlightPage?: number;
  highlightSnippet?: string;
}

// Simulated document pages content
const DOC_PAGES = [
  {
    page: 1,
    title: "Executive Summary",
    content: `This report provides a comprehensive analysis of regional revenue performance for Q3 2023. Key findings indicate consolidated revenue growth of 14.2% year-over-year across all operating segments, with notable outperformance in the Asia-Pacific region.

Revenue growth has been driven primarily by expanding market penetration in enterprise accounts, supported by product innovation and enhanced customer success programs. The following sections detail regional breakdowns, segment performance, and forward-looking guidance.`,
  },
  {
    page: 4,
    title: "Regional Revenue Analysis",
    content: `Our key market segments show significant growth at 14.2% YoY, with regional variations reflecting distinct economic conditions and competitive dynamics.

North America continued to lead in absolute revenue contribution at $345M (+11.5% YoY), representing 42.0% of total consolidated revenue. The EMEA region demonstrated the strongest momentum in growth velocity at +16.8% YoY, generating $280M in total revenue. Asia-Pacific achieved the highest growth rate of +22.1% YoY, contributing $195M to consolidated results.

The remaining international markets contributed $6M, an increase of +8.3% YoY, representing a smaller but growing segment of the overall business.`,
    highlight: true,
  },
  {
    page: 5,
    title: "Segment Performance",
    content: `Enterprise accounts continued to represent the highest value customer segment, with average contract values increasing by 18% compared to the same period last year. Mid-market customers demonstrated strong adoption rates, with net revenue retention exceeding 115% across the cohort.`,
  },
];

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentTitle,
  highlightPage,
  highlightSnippet,
}) => {
  const [zoom, setZoom] = useState(100);
  const [layout, setLayout] = useState<"single" | "list">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 32;

  const handleZoomIn = () => setZoom((z) => Math.min(z + 15, 175));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 15, 60));

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--color-canvas)" }}
    >
      {/* ── Toolbar ── */}
      <div
        className="flex items-center justify-between px-4 h-11 shrink-0"
        style={{
          background: "var(--color-base)",
          borderBottom: "1px solid var(--color-border-hairline)",
        }}
      >
        {/* Doc title */}
        <div className="flex items-center gap-2 min-w-0">
          <FileText
            size={14}
            style={{ color: "var(--color-brand-400)" }}
            className="shrink-0"
          />
          <span
            className="text-xs font-medium truncate"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {documentTitle || "Select or Upload a Document"}
          </span>
          <span
            className="shrink-0 text-2xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              color: "var(--color-text-muted)",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            32 pages
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-0.5">
          {/* Layout toggle */}
          <button
            className={`toolbar-btn ${layout === "list" ? "active" : ""}`}
            onClick={() => setLayout("list")}
            title="List view"
          >
            <LayoutList size={14} />
          </button>
          <button
            className={`toolbar-btn ${layout === "single" ? "active" : ""}`}
            onClick={() => setLayout("single")}
            title="Single page"
          >
            <BookOpen size={14} />
          </button>

          <div
            className="w-px h-5 mx-1"
            style={{ background: "var(--color-border-subtle)" }}
          />

          {/* Page nav (single page mode) */}
          {layout === "single" && (
            <>
              <button
                className="toolbar-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
              </button>
              <span
                className="text-xs font-mono px-2"
                style={{
                  color: "var(--color-text-muted)",
                  minWidth: "60px",
                  textAlign: "center",
                }}
              >
                {currentPage} / {totalPages}
              </span>
              <button
                className="toolbar-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={14} />
              </button>

              <div
                className="w-px h-5 mx-1"
                style={{ background: "var(--color-border-subtle)" }}
              />
            </>
          )}

          {/* Zoom */}
          <button
            className="toolbar-btn"
            onClick={handleZoomOut}
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <span
            className="text-xs font-mono px-1 tabular-nums"
            style={{
              color: "var(--color-text-muted)",
              minWidth: "40px",
              textAlign: "center",
            }}
          >
            {zoom}%
          </span>
          <button
            className="toolbar-btn"
            onClick={handleZoomIn}
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>

          <div
            className="w-px h-5 mx-1"
            style={{ background: "var(--color-border-subtle)" }}
          />

          <button className="toolbar-btn" title="Download">
            <Download size={14} />
          </button>
          <button className="toolbar-btn" title="Print">
            <Printer size={14} />
          </button>
          <button className="toolbar-btn" title="Fullscreen">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* ── Document Pages ── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "24px", background: "var(--color-canvas)" }}
      >
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          {DOC_PAGES.map((p) => {
            const isHighlighted = p.page === highlightPage || p.highlight;
            return (
              <div
                key={p.page}
                id={`doc-page-${p.page}`}
                className="mb-6 animate-slide-up"
              >
                {/* Page header */}
                <div
                  className="flex items-center justify-between mb-3"
                  style={{ opacity: 0.7 }}
                >
                  <span
                    className="text-2xs font-semibold uppercase tracking-widest"
                    style={{ color: "var(--color-text-disabled)" }}
                  >
                    Page {p.page}
                  </span>
                  <span
                    className="text-2xs"
                    style={{ color: "var(--color-text-disabled)" }}
                  >
                    Q3_2023_Report.pdf
                  </span>
                </div>

                {/* Document "paper" */}
                <div
                  className="relative rounded-md overflow-hidden"
                  style={{
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                    transition: "transform 200ms ease",
                    background: "#fff",
                    boxShadow: isHighlighted
                      ? "var(--shadow-lg), 0 0 0 2px rgba(99,102,241,0.5)"
                      : "var(--shadow-md)",
                  }}
                >
                  {/* Highlight ribbon */}
                  {isHighlighted && (
                    <div
                      className="h-0.5 w-full"
                      style={{ background: "var(--color-brand-500)" }}
                    />
                  )}

                  <div style={{ padding: "48px 52px", minHeight: "280px" }}>
                    {/* Chapter label */}
                    <div
                      className="text-2xs font-mono uppercase tracking-widest mb-4"
                      style={{ color: "#9CA3AF" }}
                    >
                      Section {p.page} — DocTalker Analysis
                    </div>

                    {/* Section title */}
                    <h3
                      className="text-xl font-bold mb-5"
                      style={{
                        color: "#111827",
                        letterSpacing: "-0.02em",
                        borderBottom: "2px solid #F3F4F6",
                        paddingBottom: "12px",
                      }}
                    >
                      {p.title}
                    </h3>

                    {/* Body text */}
                    <div
                      className="text-sm leading-relaxed"
                      style={{ color: "#374151", lineHeight: "1.8" }}
                    >
                      {p.page === 4 && highlightSnippet ? (
                        <>
                          {p.content
                            .split(highlightSnippet)
                            .map((part, i, arr) => (
                              <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                  <mark
                                    style={{
                                      background: "rgba(99,102,241,0.18)",
                                      color: "#1E1B4B",
                                      borderRadius: "2px",
                                      padding: "0 2px",
                                    }}
                                  >
                                    {highlightSnippet}
                                  </mark>
                                )}
                              </React.Fragment>
                            ))}
                        </>
                      ) : (
                        p.content.split("\n\n").map((para, i) => (
                          <p key={i} style={{ marginBottom: "1em" }}>
                            {para}
                          </p>
                        ))
                      )}
                    </div>

                    {/* Page number footer */}
                    <div
                      className="text-center text-xs mt-8 pt-4"
                      style={{
                        borderTop: "1px solid #F3F4F6",
                        color: "#9CA3AF",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {p.page}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;

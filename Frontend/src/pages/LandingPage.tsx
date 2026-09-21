import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  Globe,
  Video,
  PenTool,
  Check,
  Zap,
  Shield,
  MessageSquare,
  ChevronRight,
  Bot,
  Send,
  Menu,
  X,
} from "lucide-react";
import HeroScene from "../components/3d/HeroScene";

/* ─── Constants ──────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

const FEATURES = [
  {
    icon: FileText,
    color: "#818CF8",
    bg: "rgba(99,102,241,0.1)",
    title: "PDF & Documents",
    desc: "Upload research papers, contracts, or reports. Instantly queryable with pinpoint page citations.",
  },
  {
    icon: Globe,
    color: "#38BDF8",
    bg: "rgba(56,189,248,0.1)",
    title: "Web Scraping",
    desc: "Paste any public URL. DocTalker fetches, parses, and indexes the full content in seconds.",
  },
  {
    icon: Video,
    color: "#F43F5E",
    bg: "rgba(244,63,94,0.1)",
    title: "YouTube Transcripts",
    desc: "Drop a YouTube link. Full transcript extracted and ready for AI-powered Q&A.",
  },
  {
    icon: PenTool,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
    title: "Handwriting OCR",
    desc: "Scan handwritten notes with AI-powered optical character recognition and query them instantly.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Upload any content",
    desc: "PDF, URL, YouTube video, or a photo of handwritten notes.",
  },
  {
    n: "02",
    title: "AI indexes it",
    desc: "GPT-4o, Gemini, or Claude reads and understands your content.",
  },
  {
    n: "03",
    title: "Ask anything",
    desc: "Get cited answers with clickable page references — no hallucination.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    priceSave: "$0",
    period: "forever",
    desc: "Get started for free, no card required.",
    features: [
      "50 queries / month",
      "5 document slots",
      "PDF & URL ingestion",
      "Community support",
    ],
    cta: "Get Started Free",
    ctaLink: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    priceSave: "$10",
    period: "/ month",
    badge: "Most Popular",
    desc: "Everything you need for serious research.",
    features: [
      "1,000 queries / month",
      "Unlimited documents",
      "All 4 ingestion types",
      "GPT-4o, Gemini & Claude",
      "Citation tracking & export",
    ],
    cta: "Start Free Trial",
    ctaLink: "/signup",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$49",
    priceSave: "$39",
    period: "/ month",
    desc: "Built for teams and organizations.",
    features: [
      "Unlimited queries",
      "Unlimited documents",
      "Shared workspaces",
      "Admin dashboard",
      "SSO + REST API access",
    ],
    cta: "Contact Sales",
    ctaLink: "/signup",
    highlighted: false,
  },
];

/* ─── Workspace Stage Preview ────────────────────────────── */

const WorkspaceStage: React.FC = () => (
  <div
    className="w-full overflow-hidden"
    style={{
      borderRadius: "16px",
      background: "var(--color-base)",
      border: "1px solid var(--color-border-default)",
      boxShadow:
        "0 40px 120px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
    }}
  >
    {/* Window chrome */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 16px",
        borderBottom: "1px solid var(--color-border-hairline)",
        background: "var(--color-canvas)",
      }}
    >
      <div style={{ display: "flex", gap: "6px" }}>
        {["#F43F5E", "#F59E0B", "#10B981"].map((c) => (
          <div
            key={c}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: c,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
      <div style={{ flex: 1, textAlign: "center" }}>
        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-disabled)",
          }}
        >
          app.doctalker.ai/workspace
        </span>
      </div>
    </div>

    {/* App layout */}
    <div style={{ display: "flex", height: "420px" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "200px",
          flexShrink: 0,
          padding: "16px 12px",
          borderRight: "1px solid var(--color-border-hairline)",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "16px",
            padding: "0 4px",
          }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "var(--color-brand-600)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "9px",
              fontWeight: 700,
              color: "#fff",
            }}
          >
            DT
          </div>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "var(--color-text-primary)",
            }}
          >
            DocTalker
          </span>
        </div>

        <div
          style={{
            fontSize: "9px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "var(--color-text-disabled)",
            padding: "0 8px",
            marginBottom: "4px",
          }}
        >
          Chats
        </div>

        {[
          { t: "Q3 Business Report", a: true },
          { t: "AI Research Paper", a: false },
          { t: "Sales Forecast Q4", a: false },
        ].map((c) => (
          <div
            key={c.t}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 8px",
              borderRadius: "6px",
              cursor: "pointer",
              background: c.a ? "var(--color-surface-2)" : "transparent",
              borderLeft: c.a
                ? "2px solid var(--color-brand-500)"
                : "2px solid transparent",
              paddingLeft: c.a ? "6px" : "8px",
            }}
          >
            <MessageSquare
              size={11}
              style={{
                color: c.a
                  ? "var(--color-brand-400)"
                  : "var(--color-text-muted)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: c.a
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {c.t}
            </span>
          </div>
        ))}
      </div>

      {/* Document pane */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          borderRight: "1px solid var(--color-border-hairline)",
          background: "var(--color-canvas)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "8px",
            padding: "28px 32px",
            height: "100%",
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              fontFamily: "var(--font-mono)",
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            Page 4 — Regional Revenue Analysis
          </div>
          <h4
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#111827",
              letterSpacing: "-0.02em",
              marginBottom: "12px",
              lineHeight: "1.3",
            }}
          >
            Q3 2023 Performance Summary
          </h4>
          <p
            style={{
              fontSize: "12px",
              lineHeight: "1.8",
              color: "#374151",
              marginBottom: "10px",
            }}
          >
            Consolidated revenue growth of 14.2% YoY across all operating
            segments, with notable outperformance in Asia-Pacific.
          </p>
          <p style={{ fontSize: "12px", lineHeight: "1.8", color: "#374151" }}>
            <mark
              style={{
                background: "rgba(99,102,241,0.18)",
                borderRadius: "3px",
                padding: "1px 3px",
                fontWeight: 500,
              }}
            >
              North America: $345M (+11.5%), EMEA: $280M (+16.8%), Asia-Pacific:
              $195M (+22.1%)
            </mark>
          </p>
        </div>
      </div>

      {/* Chat pane */}
      <div
        style={{
          width: "280px",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--color-canvas)",
        }}
      >
        {/* Chat header */}
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid var(--color-border-hairline)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--color-success)",
            }}
          />
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--color-text-secondary)",
            }}
          >
            AI Assistant
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "9px",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "999px",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border-subtle)",
              color: "var(--color-text-muted)",
            }}
          >
            GPT-4o
          </span>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            padding: "14px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            overflow: "hidden",
          }}
        >
          {/* User */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "10px 10px 2px 10px",
                padding: "8px 12px",
                maxWidth: "85%",
                fontSize: "11px",
                lineHeight: "1.6",
                color: "var(--color-text-primary)",
              }}
            >
              What regions grew fastest in Q3?
            </div>
          </div>

          {/* AI */}
          <div style={{ display: "flex", gap: "8px" }}>
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                flexShrink: 0,
                background: "var(--color-surface-2)",
                border: "1px solid var(--color-border-subtle)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "2px",
              }}
            >
              <Bot size={11} style={{ color: "var(--color-text-secondary)" }} />
            </div>
            <div
              style={{
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "2px 10px 10px 10px",
                padding: "8px 12px",
                maxWidth: "85%",
                fontSize: "11px",
                lineHeight: "1.7",
                color: "var(--color-text-primary)",
              }}
            >
              <strong>Asia-Pacific led with +22.1% YoY</strong>, followed by
              EMEA at +16.8%.{" "}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "1px 6px",
                  borderRadius: "999px",
                  fontSize: "10px",
                  fontWeight: 600,
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.22)",
                  color: "var(--color-brand-300)",
                }}
              >
                <FileText size={8} /> p.4
              </span>
            </div>
          </div>
        </div>

        {/* Input */}
        <div
          style={{
            padding: "10px 12px",
            borderTop: "1px solid var(--color-border-hairline)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "var(--color-input)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "8px",
              padding: "7px 10px",
            }}
          >
            <span
              style={{
                flex: 1,
                fontSize: "11px",
                color: "var(--color-text-disabled)",
              }}
            >
              Ask about your documents…
            </span>
            <div
              style={{
                width: "22px",
                height: "22px",
                borderRadius: "6px",
                background: "var(--color-brand-600)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={10} color="#fff" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* ─── Landing Page ───────────────────────────────────────── */

export const LandingPage: React.FC = () => {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-canvas)",
        color: "var(--color-text-primary)",
        overflowX: "hidden",
      }}
    >
      <HeroScene />

      {/* ══ NAVIGATION ══════════════════════════════════════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: scrolled ? "rgba(8,12,20,0.92)" : "rgba(8,12,20,0.6)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--color-border-hairline)",
          transition: "background 200ms ease",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "0 24px",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                background: "var(--color-brand-600)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "11px",
                color: "#fff",
                boxShadow: "var(--shadow-brand-sm)",
              }}
            >
              DT
            </div>
            <span
              style={{
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "-0.01em",
                color: "var(--color-text-primary)",
              }}
            >
              DocTalker
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            style={{ display: "none", alignItems: "center", gap: "32px" }}
            className="md-nav"
          >
            <style>{`@media (min-width: 768px) { .md-nav { display: flex !important; } .mobile-menu-btn { display: none !important; } }`}</style>
            {NAV_LINKS.map((n) => (
              <a
                key={n.label}
                href={n.href}
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  textDecoration: "none",
                  transition: "color 120ms",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-secondary)")
                }
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Link
              to="/login"
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                padding: "7px 14px",
                borderRadius: "8px",
                textDecoration: "none",
                display: "none",
              }}
              className="md-signin"
            >
              <style>{`@media (min-width: 768px) { .md-signin { display: block !important; } }`}</style>
              Sign In
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary btn-sm"
              id="btn-nav-signup"
            >
              Get Started
              <ArrowRight size={13} />
            </Link>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="mobile-menu-btn toolbar-btn"
              style={{ width: "36px", height: "36px" }}
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            style={{
              background: "var(--color-base)",
              borderTop: "1px solid var(--color-border-hairline)",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {NAV_LINKS.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--color-text-secondary)",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--color-border-hairline)",
                  textDecoration: "none",
                }}
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: "15px",
                fontWeight: 500,
                color: "var(--color-text-secondary)",
                padding: "10px 0",
                textDecoration: "none",
              }}
            >
              Sign In
            </Link>
          </div>
        )}
      </header>

      {/* ══ HERO ════════════════════════════════════════════════ */}
      <section
        style={{
          position: "relative",
          paddingTop: "96px",
          paddingBottom: "72px",
          textAlign: "center",
          padding: "96px 24px 72px",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          {/* Label */}
          <div style={{ marginBottom: "24px" }}>
            <span className="badge badge-brand">
              <Zap size={9} />
              GPT-4o · Gemini 2.5 · Claude 3.5 Sonnet
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(2.6rem, 7vw, 5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.04em",
              color: "var(--color-text-primary)",
              margin: "0 0 20px",
            }}
          >
            Your Documents.{" "}
            <span style={{ color: "var(--color-brand-400)" }}>
              Now They Talk Back.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontSize: "18px",
              lineHeight: "1.7",
              color: "var(--color-text-secondary)",
              maxWidth: "560px",
              margin: "0 auto 36px",
            }}
          >
            Upload PDFs, paste URLs, drop YouTube links, or scan handwritten
            notes. Chat with your content — with direct page citations.
          </p>

          {/* CTA row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <Link
              to="/signup"
              className="btn btn-primary btn-lg"
              id="btn-hero-primary"
            >
              Start for Free
              <ArrowRight size={16} />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              How it works
            </a>
          </div>

          <p style={{ fontSize: "12px", color: "var(--color-text-disabled)" }}>
            No credit card required — 50 free queries included
          </p>
        </div>
      </section>

      {/* ══ WORKSPACE STAGE ═════════════════════════════════════ */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <WorkspaceStage />
        </div>
      </section>

      {/* ══ TRUST BAR ═══════════════════════════════════════════ */}
      <section
        style={{
          borderTop: "1px solid var(--color-border-hairline)",
          borderBottom: "1px solid var(--color-border-hairline)",
          padding: "28px 24px",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <p
            style={{
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-text-disabled)",
              marginBottom: "20px",
            }}
          >
            Powered by the world's best AI
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              gap: "40px",
            }}
          >
            {["OpenAI", "Google", "Anthropic", "Stripe", "Brevo"].map((b) => (
              <span
                key={b}
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: "var(--color-text-primary)",
                  opacity: 0.25,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ════════════════════════════════════════════ */}
      <section id="features" style={{ padding: "96px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span
              className="badge badge-brand"
              style={{ marginBottom: "16px" }}
            >
              Capabilities
            </span>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--color-text-primary)",
                margin: "0 0 16px",
              }}
            >
              Intelligence across every format
            </h2>
            <p
              style={{
                fontSize: "16px",
                lineHeight: "1.7",
                color: "var(--color-text-secondary)",
                maxWidth: "520px",
                margin: "0 auto",
              }}
            >
              DocTalker goes beyond PDFs — ingest virtually any content type and
              interact with it through natural language.
            </p>
          </div>

          {/* Feature cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "20px",
            }}
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="card-interactive"
                  style={{ padding: "28px" }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: f.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <Icon size={20} color={f.color} />
                  </div>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: "8px",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      lineHeight: "1.7",
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ════════════════════════════════════════ */}
      <section id="how-it-works" style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              borderRadius: "16px",
              border: "1px solid var(--color-border-subtle)",
              background: "var(--color-surface-0)",
              padding: "56px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "52px" }}>
              <span
                className="badge badge-brand"
                style={{ marginBottom: "16px" }}
              >
                How it works
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                Three steps to insight
              </h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "40px",
              }}
            >
              {STEPS.map((s, i) => (
                <div
                  key={s.n}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "var(--color-brand-950)",
                        border: "1px solid rgba(99,102,241,0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--color-brand-400)",
                        flexShrink: 0,
                      }}
                    >
                      {s.n}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        style={{
                          flex: 1,
                          height: "1px",
                          background: "var(--color-border-subtle)",
                        }}
                        className="step-line"
                      />
                    )}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--color-text-primary)",
                        marginBottom: "6px",
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        lineHeight: "1.7",
                        color: "var(--color-text-secondary)",
                        margin: 0,
                      }}
                    >
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CITATIONS FEATURE ROW ═══════════════════════════════ */}
      <section style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Text */}
            <div>
              <span
                className="badge badge-brand"
                style={{ marginBottom: "16px" }}
              >
                Source Citations
              </span>
              <h2
                style={{
                  fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)",
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "var(--color-text-primary)",
                  marginBottom: "16px",
                }}
              >
                Every answer, traceable to the source
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  lineHeight: "1.8",
                  color: "var(--color-text-secondary)",
                  marginBottom: "24px",
                }}
              >
                DocTalker doesn't hallucinate. Every AI response includes
                clickable page citations that jump you directly to the relevant
                section in your document.
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {[
                  "Clickable page references in every answer",
                  "Highlighted text in document viewer",
                  "No hallucination — always grounded",
                ].map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        background: "rgba(16,185,129,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Check size={10} color="var(--color-success)" />
                    </div>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* UI mockup */}
            <div className="card" style={{ padding: "24px" }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-disabled)",
                  marginBottom: "16px",
                }}
              >
                Source References
              </p>
              {[
                {
                  page: 4,
                  snippet: "Regional Revenue Analysis — Key Markets...",
                  active: true,
                },
                {
                  page: 7,
                  snippet: "Growth Velocity by Segment...",
                  active: false,
                },
                {
                  page: 12,
                  snippet: "Forecast & Forward Guidance...",
                  active: false,
                },
              ].map((c) => (
                <div
                  key={c.page}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "8px",
                    cursor: "pointer",
                    background: c.active
                      ? "rgba(99,102,241,0.08)"
                      : "var(--color-surface-1)",
                    border: `1px solid ${c.active ? "rgba(99,102,241,0.25)" : "transparent"}`,
                  }}
                >
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      flexShrink: 0,
                      background: c.active
                        ? "rgba(99,102,241,0.15)"
                        : "var(--color-surface-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FileText
                      size={13}
                      color={
                        c.active
                          ? "var(--color-brand-400)"
                          : "var(--color-text-muted)"
                      }
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: c.active
                          ? "var(--color-brand-300)"
                          : "var(--color-text-secondary)",
                        marginBottom: "2px",
                      }}
                    >
                      Page {c.page}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--color-text-muted)",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {c.snippet}
                    </div>
                  </div>
                  {c.active && (
                    <ChevronRight size={14} color="var(--color-brand-400)" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PRICING ═════════════════════════════════════════════ */}
      <section id="pricing" style={{ padding: "0 24px 96px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <span
              className="badge badge-brand"
              style={{ marginBottom: "16px" }}
            >
              Pricing
            </span>
            <h2
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--color-text-primary)",
                marginBottom: "12px",
              }}
            >
              Simple, transparent pricing
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "var(--color-text-secondary)",
                marginBottom: "28px",
              }}
            >
              Start free. Upgrade when you need more.
            </p>

            {/* Billing toggle */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                background: "var(--color-surface-1)",
                border: "1px solid var(--color-border-subtle)",
                borderRadius: "999px",
                padding: "4px",
              }}
            >
              {["Monthly", "Annual"].map((b) => {
                const isActive = (b === "Annual") === billingAnnual;
                return (
                  <button
                    key={b}
                    onClick={() => setBillingAnnual(b === "Annual")}
                    style={{
                      padding: "6px 16px",
                      borderRadius: "999px",
                      fontSize: "13px",
                      fontWeight: 600,
                      border: isActive
                        ? "1px solid var(--color-border-default)"
                        : "1px solid transparent",
                      background: isActive
                        ? "var(--color-surface-2)"
                        : "transparent",
                      color: isActive
                        ? "var(--color-text-primary)"
                        : "var(--color-text-muted)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    {b}
                    {b === "Annual" && (
                      <span
                        style={{
                          fontSize: "9px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "999px",
                          background: "rgba(16,185,129,0.15)",
                          color: "var(--color-success)",
                        }}
                      >
                        –20%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
              maxWidth: "960px",
              margin: "0 auto",
            }}
          >
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                style={{
                  position: "relative",
                  padding: "32px",
                  borderRadius: "16px",
                  background: plan.highlighted
                    ? "var(--color-brand-950)"
                    : "var(--color-surface-0)",
                  border: `1px solid ${plan.highlighted ? "rgba(99,102,241,0.5)" : "var(--color-border-subtle)"}`,
                  boxShadow: plan.highlighted
                    ? "var(--shadow-brand-md)"
                    : "var(--shadow-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {plan.badge && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-13px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span className="badge badge-brand">{plan.badge}</span>
                  </div>
                )}

                {/* Plan header */}
                <div>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: plan.highlighted
                        ? "var(--color-brand-300)"
                        : "var(--color-text-muted)",
                      marginBottom: "12px",
                    }}
                  >
                    {plan.name}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "4px",
                      marginBottom: "6px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "40px",
                        fontWeight: 800,
                        color: "var(--color-text-primary)",
                        letterSpacing: "-0.04em",
                        lineHeight: 1,
                      }}
                    >
                      {billingAnnual && plan.price !== "$0"
                        ? plan.priceSave
                        : plan.price}
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "var(--color-text-muted)",
                      margin: 0,
                    }}
                  >
                    {plan.desc}
                  </p>
                </div>

                {/* Features */}
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    margin: 0,
                    padding: 0,
                    flex: 1,
                    listStyle: "none",
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          flexShrink: 0,
                          background: plan.highlighted
                            ? "rgba(99,102,241,0.15)"
                            : "rgba(16,185,129,0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Check
                          size={9}
                          color={
                            plan.highlighted
                              ? "var(--color-brand-400)"
                              : "var(--color-success)"
                          }
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "13px",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.ctaLink}
                  className={`btn ${plan.highlighted ? "btn-primary" : "btn-secondary"} btn-md`}
                  style={{ justifyContent: "center", width: "100%" }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TRUST / SECURITY ════════════════════════════════════ */}
      <section
        style={{
          padding: "0 24px 96px",
          borderTop: "1px solid var(--color-border-hairline)",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
            paddingTop: "80px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <Shield size={16} color="var(--color-success)" />
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
              }}
            >
              Enterprise-grade security
            </span>
          </div>
          <h2
            style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.25rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--color-text-primary)",
              marginBottom: "16px",
            }}
          >
            Your data stays yours
          </h2>
          <p
            style={{
              fontSize: "15px",
              lineHeight: "1.8",
              color: "var(--color-text-secondary)",
              marginBottom: "36px",
            }}
          >
            All documents are encrypted at rest and in transit. We never use
            your data to train AI models. Fully GDPR compliant.
          </p>
          <Link
            to="/signup"
            className="btn btn-primary btn-lg"
            id="btn-bottom-cta"
          >
            Start for Free Today
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ══════════════════════════════════════════════ */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border-hairline)",
          padding: "32px 24px",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: "var(--color-brand-600)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "9px",
                fontWeight: 800,
                color: "#fff",
              }}
            >
              DT
            </div>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
              }}
            >
              DocTalker
            </span>
          </div>

          {/* Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            {["Privacy", "Terms", "Pricing", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                style={{
                  fontSize: "13px",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  transition: "color 120ms",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--color-text-muted)")
                }
              >
                {l}
              </a>
            ))}
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "var(--color-text-disabled)",
              margin: 0,
            }}
          >
            © 2024 DocTalker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

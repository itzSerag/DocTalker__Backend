/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // ─── Color Palette ────────────────────────────────────────────────────
      colors: {
        // Background hierarchy (darkest → lightest)
        canvas: "#080C14",
        base: "#0C1018",
        surface: {
          0: "#111827",
          1: "#1A2235",
          2: "#232D42",
          3: "#2C3A52",
        },
        inp: "#0E1421",

        // Primary brand (indigo ramp)
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#1E1B4B",
          950: "#13103A",
        },

        // Accent colors
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#F43F5E",
        info: "#0EA5E9",

        // Border tokens (using opacity-aware values via CSS vars)
        "border-hairline": "rgba(255,255,255,0.04)",
        "border-subtle": "rgba(255,255,255,0.07)",
        "border-default": "rgba(255,255,255,0.12)",
        "border-strong": "rgba(255,255,255,0.22)",
      },

      // ─── Typography ───────────────────────────────────────────────────────
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Fira Code"', "monospace"],
        display: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["10px", { lineHeight: "14px", letterSpacing: "0.04em" }],
        xs: ["12px", { lineHeight: "16px", letterSpacing: "0.01em" }],
        sm: ["13px", { lineHeight: "20px" }],
        base: ["14px", { lineHeight: "22px" }],
        md: ["15px", { lineHeight: "24px" }],
        lg: ["17px", { lineHeight: "26px" }],
        xl: ["20px", { lineHeight: "28px", letterSpacing: "-0.01em" }],
        "2xl": ["24px", { lineHeight: "32px", letterSpacing: "-0.02em" }],
        "3xl": ["30px", { lineHeight: "36px", letterSpacing: "-0.02em" }],
        "4xl": ["36px", { lineHeight: "42px", letterSpacing: "-0.03em" }],
        "5xl": ["48px", { lineHeight: "54px", letterSpacing: "-0.04em" }],
        "6xl": ["64px", { lineHeight: "68px", letterSpacing: "-0.04em" }],
      },
      fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      },

      // ─── Spacing / Sizing ─────────────────────────────────────────────────
      borderRadius: {
        none: "0",
        xs: "4px",
        sm: "8px",
        DEFAULT: "10px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },

      // ─── Shadows ──────────────────────────────────────────────────────────
      boxShadow: {
        xs: "0 1px 2px rgba(0,0,0,0.5)",
        sm: "0 2px 8px rgba(0,0,0,0.4)",
        md: "0 8px 24px rgba(0,0,0,0.5)",
        lg: "0 20px 60px rgba(0,0,0,0.6)",
        xl: "0 32px 80px rgba(0,0,0,0.7)",
        "brand-sm": "0 4px 14px rgba(99,102,241,0.25)",
        "brand-md": "0 8px 28px rgba(99,102,241,0.35)",
        "brand-lg": "0 16px 48px rgba(99,102,241,0.4)",
        inset: "inset 0 1px 0 rgba(255,255,255,0.05)",
        none: "none",
      },

      // ─── Transitions ──────────────────────────────────────────────────────
      transitionDuration: {
        fast: "120ms",
        normal: "200ms",
        slow: "350ms",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },

      // ─── Animations ───────────────────────────────────────────────────────
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 200ms ease-out forwards",
        "slide-up": "slideUp 250ms ease-out forwards",
        "slide-in-left": "slideInLeft 250ms ease-out forwards",
        "scale-in": "scaleIn 200ms ease-out forwards",
        shimmer: "shimmer 2.5s infinite linear",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        spin: "spin 1s linear infinite",
      },

      // ─── Layout ───────────────────────────────────────────────────────────
      maxWidth: {
        sidebar: "260px",
        chat: "480px",
        prose: "680px",
        stage: "1200px",
      },
      zIndex: {
        base: "0",
        raised: "10",
        overlay: "20",
        modal: "50",
        toast: "60",
        top: "100",
      },
    },
  },
  plugins: [],
};

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User as UserIcon,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
} from "lucide-react";
import HeroScene from "../components/3d/HeroScene";

export const SignupPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await signup({ firstName, lastName, email, password });
      navigate("/verify-otp", { state: { email } });
    } catch (err: unknown) {
      const resError = err as { response?: { data?: { message?: string } } };
      setError(
        resError.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 py-10"
      style={{ background: "var(--color-canvas)" }}
    >
      <HeroScene />

      <div
        className="relative z-10 w-full animate-scale-in"
        style={{ maxWidth: "420px" }}
      >
        <div
          className="rounded-xl p-7"
          style={{
            background: "var(--color-surface-0)",
            border: "1px solid var(--color-border-default)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Brand */}
          <div className="text-center mb-7">
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 mb-4 group"
            >
              <div
                className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm text-white"
                style={{
                  background: "var(--color-brand-600)",
                  boxShadow: "var(--shadow-brand-md)",
                }}
              >
                DT
              </div>
              <span
                className="font-bold text-lg tracking-tight"
                style={{ color: "var(--color-text-primary)" }}
              >
                DocTalker
              </span>
            </Link>

            <span className="badge badge-brand mb-3">
              Free — 50 Queries Included
            </span>

            <h1
              className="text-xl font-bold mb-1"
              style={{
                color: "var(--color-text-primary)",
                letterSpacing: "-0.02em",
              }}
            >
              Create your account
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Start talking to your documents in seconds
            </p>
          </div>

          {/* Google OAuth */}
          <a
            href="/api/user/auth/google"
            className="flex items-center justify-center gap-3 w-full rounded-sm text-sm font-semibold transition-all group mb-5"
            style={{
              padding: "10px 16px",
              background: "var(--color-surface-1)",
              border: "1px solid var(--color-border-default)",
              color: "var(--color-text-secondary)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign up with Google
          </a>

          <div className="divider mb-5">or sign up with email</div>

          {error && (
            <div
              className="mb-4 p-3 rounded-sm text-xs"
              style={{
                background: "rgba(244,63,94,0.08)",
                border: "1px solid rgba(244,63,94,0.2)",
                color: "var(--color-danger)",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  First name{" "}
                  <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <div className="input-icon">
                  <UserIcon
                    size={13}
                    style={{ color: "var(--color-text-muted)" }}
                    className="shrink-0"
                  />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="input"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Email address{" "}
                <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <div className="input-icon">
                <Mail
                  size={13}
                  style={{ color: "var(--color-text-muted)" }}
                  className="shrink-0"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Password <span style={{ color: "var(--color-danger)" }}>*</span>
              </label>
              <div className="input-icon">
                <Lock
                  size={13}
                  style={{ color: "var(--color-text-muted)" }}
                  className="shrink-0"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-2"
              id="btn-signup-submit"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>

            <p
              className="text-xs text-center"
              style={{ color: "var(--color-text-disabled)" }}
            >
              By creating an account you agree to our{" "}
              <a href="#" style={{ color: "var(--color-text-muted)" }}>
                Terms of Service
              </a>
              {" & "}
              <a href="#" style={{ color: "var(--color-text-muted)" }}>
                Privacy Policy
              </a>
            </p>
          </form>

          <div
            className="mt-6 pt-5 text-center space-y-2"
            style={{ borderTop: "1px solid var(--color-border-hairline)" }}
          >
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold transition-colors"
                style={{ color: "var(--color-brand-400)" }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

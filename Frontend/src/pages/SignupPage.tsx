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
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await signup({ firstName, lastName, email, password });
      // Always redirect to OTP verification after successful signup
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
    <div className="relative min-h-screen flex items-center justify-center p-4 py-10 bg-slate-950 font-sans antialiased selection:bg-indigo-500/30">
      <HeroScene />

      <div className="relative z-10 w-full max-w-[420px] animate-scale-in">
        <div className="rounded-2xl p-8 bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 shadow-2xl">
          {/* Brand */}
          <div className="text-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-3 mb-5 group transition-transform hover:scale-105"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-indigo-600/30">
                DT
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">
                DocTalker
              </span>
            </Link>

            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Free — 50 Queries Included
              </span>
            </div>

            <h1 className="text-2xl font-bold mb-2 text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-sm text-slate-400">
              Start talking to your documents in seconds
            </p>
          </div>

          {/* Google OAuth */}
          <a
            href="/api/user/auth/google"
            className="flex items-center justify-center gap-3 w-full rounded-xl text-sm font-semibold transition-all group mb-6 px-4 py-3 bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white shadow-sm"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              className="shrink-0 group-hover:scale-110 transition-transform"
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

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 text-slate-300">
                  First name <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                  <UserIcon size={16} className="text-slate-500 shrink-0" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-slate-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 text-slate-300">
                  Last name
                </label>
                <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-slate-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-slate-300">
                Email address <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                <Mail size={16} className="text-slate-500 shrink-0" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 text-slate-300">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950/50 border border-slate-700/50 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                <Lock size={16} className="text-slate-500 shrink-0" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="bg-transparent border-none outline-none w-full text-sm text-white placeholder-slate-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed group"
              id="btn-signup-submit"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-500 mt-4">
              By creating an account you agree to our{" "}
              <a
                href="#"
                className="text-slate-400 hover:text-slate-300 transition-colors"
              >
                Terms of Service
              </a>
              {" & "}
              <a
                href="#"
                className="text-slate-400 hover:text-slate-300 transition-colors"
              >
                Privacy Policy
              </a>
            </p>
          </form>

          <div className="mt-8 pt-6 text-center border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
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

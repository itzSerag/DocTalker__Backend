import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail } from "lucide-react";
import HeroScene from "../components/3d/HeroScene";
import { authApi } from "../api/authApi";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      if (!requested) {
        const response = await authApi.forgotPassword(
          email.trim().toLowerCase(),
        );
        setRequested(true);
        setMessage(response.message);
      } else {
        if (!/^\d{6}$/.test(otp)) {
          setError("Enter the 6-digit code from your email.");
          return;
        }
        if (newPassword.length < 8) {
          setError("Your new password must be at least 8 characters.");
          return;
        }
        const response = await authApi.setNewPassword({
          email: email.trim().toLowerCase(),
          otp,
          newPassword,
        });
        setRequested(false);
        setOtp("");
        setNewPassword("");
        setMessage(`${response.message} You can now sign in.`);
      }
    } catch (cause: unknown) {
      const response = cause as { response?: { data?: { message?: string } } };
      setError(
        response.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 font-sans antialiased">
      <HeroScene />
      <section className="relative z-10 w-full max-w-[420px] rounded-2xl p-8 bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center mb-5">
          {requested ? (
            <KeyRound className="text-indigo-300" />
          ) : (
            <Mail className="text-indigo-300" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {requested ? "Reset your password" : "Forgot your password?"}
        </h1>
        <p className="mt-2 mb-6 text-sm text-slate-400">
          {requested
            ? `Enter the 6-digit code sent to ${email} and choose a new password.`
            : "Enter your account email and we’ll send you a reset code."}
        </p>

        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-300"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            role="status"
            className="mb-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex gap-2"
          >
            <CheckCircle2 size={17} className="shrink-0" />
            {message}
          </p>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="reset-email"
              className="mb-2 block text-xs font-semibold text-slate-300"
            >
              Email address
            </label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={requested}
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 disabled:text-slate-400"
              placeholder="name@company.com"
            />
          </div>
          {requested && (
            <>
              <div>
                <label
                  htmlFor="reset-code"
                  className="mb-2 block text-xs font-semibold text-slate-300"
                >
                  Verification code
                </label>
                <input
                  id="reset-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  required
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm tracking-[0.35em] text-white outline-none focus:border-indigo-500"
                  placeholder="••••••"
                />
              </div>
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-xs font-semibold text-slate-300"
                >
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  placeholder="At least 8 characters"
                />
              </div>
            </>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Please wait…
              </>
            ) : requested ? (
              "Update password"
            ) : (
              "Send reset code"
            )}
          </button>
        </form>

        {requested && (
          <button
            type="button"
            onClick={() => {
              setRequested(false);
              setError(null);
              setMessage(null);
            }}
            className="mt-4 w-full text-center text-xs font-medium text-indigo-300 hover:text-white"
          >
            Use a different email
          </button>
        )}
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;

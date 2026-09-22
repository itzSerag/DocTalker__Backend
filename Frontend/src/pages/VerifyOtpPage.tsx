import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HeroScene } from "../components/3d/HeroScene";
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

const RESEND_COOLDOWN = 60; // seconds

export const VerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOtp, resendOtp } = useAuth();

  const email = (location.state as { email?: string })?.email || "";
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // If no email in state, redirect to login
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    try {
      setError(null);
      setLoading(true);
      await verifyOtp(otp);
      navigate("/app");
    } catch (err: unknown) {
      const resError = err as { response?: { data?: { message?: string } } };
      setError(
        resError.response?.data?.message ||
          "Verification failed. Please check your code.",
      );
      // Clear digits on wrong code
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      setError(null);
      setResending(true);
      await resendOtp(email);
      setSuccessMessage("A new verification code has been sent to your email.");
      setTimeout(() => setSuccessMessage(null), 5000);
      startCooldown();
      setDigits(["", "", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (err: unknown) {
      const resError = err as { response?: { data?: { message?: string } } };
      setError(
        resError.response?.data?.message ||
          "Failed to resend code. Please try again later.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
      <HeroScene />

      <div className="relative z-10 w-full max-w-md animate-scale-in">
        <div className="rounded-2xl p-8 bg-slate-900/70 backdrop-blur-2xl border border-slate-800/80 shadow-2xl text-center">
          {/* Icon */}
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 mx-auto flex items-center justify-center mb-5 shadow-lg shadow-indigo-600/10">
            <ShieldCheck size={28} className="text-indigo-400" />
          </div>

          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
              DT
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              DocTalker
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
            Verify your email
          </h1>
          <p className="text-sm text-slate-400 mb-6">
            We sent a 6-digit code to{" "}
            <span className="text-slate-200 font-semibold">
              {email || "your email"}
            </span>
            . It expires in 20 minutes.
          </p>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 text-sm flex items-center gap-2 text-left">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2 text-left">
              <ShieldCheck size={16} className="shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* OTP Input Grid */}
          <form onSubmit={handleVerify}>
            <div
              className="flex justify-center gap-2.5 mb-6"
              onPaste={handlePaste}
            >
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-14 text-center text-xl font-bold rounded-xl bg-slate-950/70 border border-slate-700/60 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || digits.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/25 group"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Code</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                size={13}
                className={resending ? "animate-spin" : ""}
              />
              <span>
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </span>
            </button>

            <Link
              to="/login"
              className="hover:text-slate-200 transition-colors"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;

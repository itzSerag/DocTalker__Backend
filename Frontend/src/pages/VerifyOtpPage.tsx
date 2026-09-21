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
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
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
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError(null);
      setResending(true);
      await resendOtp(email);
      setSuccessMessage("A new verification code has been sent to your email.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const resError = err as { response?: { data?: { message?: string } } };
      setError(resError.response?.data?.message || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-app-bg text-slate-100 flex items-center justify-center p-4">
      <HeroScene />

      <div className="relative z-10 w-full max-w-md bg-app-surface border border-border-default rounded-xl p-8 shadow-xl text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto flex items-center justify-center mb-4">
          <ShieldCheck size={24} />
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Verify your email</h2>
        <p className="text-xs text-slate-400 mb-6">
          We sent a 6-digit verification code to{" "}
          <span className="text-slate-200 font-semibold">
            {email || "your email"}
          </span>
          . The code expires in 20 minutes.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 text-left">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 text-left">
            <ShieldCheck size={16} className="shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="flex justify-between gap-2 mb-6">
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
                className="w-12 h-14 text-center text-xl font-bold rounded-lg bg-app-input border border-border-default text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || digits.join("").length !== 6}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Code</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 text-primary hover:underline font-semibold disabled:opacity-50"
          >
            <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
            <span>Resend code</span>
          </button>

          <Link to="/login" className="hover:text-slate-200">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;

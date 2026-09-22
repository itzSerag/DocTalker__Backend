import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Check, Zap, Sparkles, Shield, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { paymentApi } from "../api/paymentApi";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier?: string;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentTier = "Free",
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (
    tierName: "Gold" | "Premium",
    price: number,
  ) => {
    if (!isAuthenticated) {
      onClose();
      navigate("/login", {
        state: {
          from: "/pricing",
          message: `Please sign in to subscribe to the ${tierName} plan.`,
        },
      });
      return;
    }

    try {
      setLoadingTier(tierName);
      setErrorMsg(null);
      const res = await paymentApi.createCheckoutSession(tierName, price);
      if (res.url) {
        window.location.href = res.url;
      } else {
        setErrorMsg(
          "Stripe checkout session could not be created. Please try again.",
        );
      }
    } catch (err: unknown) {
      const resError = err as { response?: { data?: { message?: string } } };
      setErrorMsg(
        resError.response?.data?.message ||
          "Payment initiation failed. Please try again.",
      );
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 sm:p-8 text-center border-b border-slate-800 bg-gradient-to-b from-indigo-950/40 to-transparent">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles size={13} />
            <span>Scale Your Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Choose the Perfect DocTalker Plan
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto mt-2">
            Unlock multimodal YouTube transcript ingestion, handwritten OCR, and
            unlimited deep vector search.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-2 p-1 mt-6 rounded-xl bg-slate-800/80 border border-slate-700">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === "yearly"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Plan 1: Free Starter */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">
                  Starter
                </span>
                {currentTier.toLowerCase() === "free" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-white">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Essential document intelligence for students and casual
                researchers.
              </p>

              <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-5">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>50 queries / day</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>5 document uploads (up to 10MB)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>Standard GPT-4o mini</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>Interactive page citations</span>
                </div>
              </div>
            </div>

            <button
              disabled
              className="w-full mt-8 py-2.5 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-400 text-xs font-semibold cursor-not-allowed text-center"
            >
              Current Active Tier
            </button>
          </div>

          {/* Plan 2: Gold Pro (Highlighted) */}
          <div className="relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-indigo-950/60 via-slate-900/90 to-slate-900 border-2 border-indigo-500/80 shadow-xl shadow-indigo-950/50">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wide uppercase shadow-md flex items-center gap-1.5">
              <Zap size={12} />
              <span>Most Popular</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-indigo-300">
                  Gold Pro
                </span>
                {currentTier.toLowerCase() === "gold" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-900/50 text-indigo-200 border border-indigo-500/40">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-white">
                  ${billingCycle === "yearly" ? "23" : "29"}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mb-6">
                High-volume intelligence for professionals, analysts, and
                engineers.
              </p>

              <div className="space-y-3 text-xs text-slate-200 border-t border-indigo-950 pt-5">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">
                    200 queries / day
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>30 document uploads (up to 50MB)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>YouTube transcripts extraction</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Gemini Vision handwritten OCR</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-emerald-400 shrink-0" />
                  <span>Priority frontier AI models</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                handleSubscribe("Gold", billingCycle === "yearly" ? 279 : 29)
              }
              disabled={loadingTier === "Gold"}
              className="w-full mt-8 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingTier === "Gold" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Connecting to Stripe...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>Upgrade to Gold Pro</span>
                </>
              )}
            </button>
          </div>

          {/* Plan 3: Premium Enterprise */}
          <div className="flex flex-col justify-between p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">
                  Premium Enterprise
                </span>
                {currentTier.toLowerCase() === "premium" && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Current Plan
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-extrabold text-white">
                  ${billingCycle === "yearly" ? "59" : "79"}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Unlimited scale, team collaboration, and dedicated Pinecone
                indexes.
              </p>

              <div className="space-y-3 text-xs text-slate-300 border-t border-slate-800/80 pt-5">
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span className="font-semibold text-white">
                    500 queries / day
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>50 document uploads (unlimited size)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>Dedicated isolated vector index</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>Multi-seat team workspace</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check size={14} className="text-indigo-400 shrink-0" />
                  <span>24/7 dedicated AI engineer support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                handleSubscribe("Premium", billingCycle === "yearly" ? 699 : 79)
              }
              disabled={loadingTier === "Premium"}
              className="w-full mt-8 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingTier === "Premium" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Connecting to Stripe...</span>
                </>
              ) : (
                <>
                  <Shield size={14} />
                  <span>Upgrade to Enterprise</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800/60 flex items-center justify-center gap-6 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield size={13} className="text-emerald-400" />
            <span>Secured with Stripe 256-bit SSL</span>
          </div>
          <span className="text-slate-600">•</span>
          <span>Cancel or switch plans anytime</span>
          <span className="text-slate-600">•</span>
          <span>Instant activation</span>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;

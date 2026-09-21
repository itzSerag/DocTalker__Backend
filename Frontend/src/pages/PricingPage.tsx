import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Zap, Sparkles, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { paymentApi } from "../api/paymentApi";
import HeroScene from "../components/3d/HeroScene";

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubscribe = async (
    tierName: "Gold" | "Premium",
    price: number,
  ) => {
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
          "Payment initiation failed. Please check your login session.",
      );
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white antialiased font-sans">
      <HeroScene />

      {/* Navigation Bar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              DT
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              DocTalker
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>
            <Link
              to="/login"
              className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/app"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20"
            >
              Launch App
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={13} />
            <span>Transparent, Scalable Pricing</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Invest in Superhuman Document Intelligence
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Read faster, extract deeper insights, and unlock multimodal
            transcripts with dedicated vector indexing.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 mt-8 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === "monthly"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                billingCycle === "yearly"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="max-w-md mx-auto mt-6 p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl text-xs text-rose-300 text-center">
            {errorMsg}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plan 1: Free Starter */}
          <div className="flex flex-col justify-between p-8 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">Starter</h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Free Forever
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                Great for students, individual developers, and exploring AI
                document reasoning.
              </p>

              <div className="space-y-3.5 text-xs text-slate-300 border-t border-slate-800 pt-6">
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span>50 queries / day</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span>5 document uploads (up to 10MB)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span>Interactive page citations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span>Standard frontier model access</span>
                </div>
              </div>
            </div>

            <Link
              to="/app"
              className="mt-8 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-all text-center block"
            >
              Start Free
            </Link>
          </div>

          {/* Plan 2: Gold Pro (Highlighted) */}
          <div className="relative flex flex-col justify-between p-8 rounded-2xl bg-gradient-to-b from-indigo-950/70 via-slate-900/90 to-slate-900 border-2 border-indigo-500 shadow-2xl shadow-indigo-950/60 backdrop-blur-md">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-md flex items-center gap-1.5">
              <Zap size={12} />
              <span>Most Popular</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-indigo-300">
                  Gold Pro
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Recommended
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-4xl font-extrabold text-white">
                  ${billingCycle === "yearly" ? "23" : "29"}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-300 mb-8 leading-relaxed">
                For researchers, executives, and analysts processing heavy
                documents and video content daily.
              </p>

              <div className="space-y-3.5 text-xs text-slate-200 border-t border-indigo-900/60 pt-6">
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  <span className="font-semibold text-white">
                    200 queries / day
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  <span>30 document uploads (up to 50MB)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  <span>YouTube video transcript extraction</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  <span>Handwritten notes & math OCR</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-emerald-400 shrink-0" />
                  <span>Priority dual-engine AI (OpenAI + Gemini)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                handleSubscribe("Gold", billingCycle === "yearly" ? 279 : 29)
              }
              disabled={loadingTier === "Gold"}
              className="mt-8 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingTier === "Gold" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Redirecting to Stripe...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Subscribe to Gold Pro</span>
                </>
              )}
            </button>
          </div>

          {/* Plan 3: Premium Enterprise */}
          <div className="flex flex-col justify-between p-8 rounded-2xl bg-slate-900/60 border border-slate-800/90 backdrop-blur-sm hover:border-slate-700 transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-white">
                  Premium Enterprise
                </h3>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Scale
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-4">
                <span className="text-4xl font-extrabold text-white">
                  ${billingCycle === "yearly" ? "59" : "79"}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-slate-400 mb-8 leading-relaxed">
                Dedicated infrastructure, unlimited file limits, and multi-user
                collaboration for enterprises.
              </p>

              <div className="space-y-3.5 text-xs text-slate-300 border-t border-slate-800 pt-6">
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span className="font-semibold text-white">
                    500 queries / day
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span>50 document uploads (unlimited size)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span>Isolated dedicated Pinecone vector index</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span>Shared team workspaces & roles</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={15} className="text-indigo-400 shrink-0" />
                  <span>Dedicated SLA & 24/7 priority support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                handleSubscribe("Premium", billingCycle === "yearly" ? 699 : 79)
              }
              disabled={loadingTier === "Premium"}
              className="mt-8 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loadingTier === "Premium" ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Redirecting to Stripe...</span>
                </>
              ) : (
                <>
                  <Shield size={14} />
                  <span>Subscribe to Enterprise</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Security & Guarantees */}
        <div className="mt-16 text-center max-w-xl mx-auto p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center justify-center gap-2 text-indigo-400 font-semibold text-xs mb-2">
            <Shield size={16} />
            <span>Enterprise-Grade Security & Privacy</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All payments are processed securely by Stripe with 256-bit
            encryption. Your private documents are never used for AI model
            training.
          </p>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;

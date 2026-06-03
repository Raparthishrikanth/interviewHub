import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { verifyEmail, error, clearError, resendVerificationEmail } = useAuthStore();
  const { addToast } = useUIStore();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    clearError();
    if (!token) {
      setStatus("error");
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus("success");
      } catch (err) {
        setStatus("error");
      }
    };

    performVerification();
  }, [token, verifyEmail, clearError]);

  const handleResend = async () => {
    if (!resendEmail.trim()) {
      addToast("Please enter your email address first.", "error");
      return;
    }
    setResendLoading(true);
    try {
      const msg = await resendVerificationEmail(resendEmail.trim());
      addToast(msg, "success");
      setResendEmail("");
    } catch (err: any) {
      addToast(err.response?.data?.error || err.response?.data?.detail || "Failed to resend verification email.", "error");
    } finally {
      setResendLoading(false);
    }
  };

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="space-y-6 py-4">
          <div className="relative flex items-center justify-center">
            {/* Elegant double-ring spinner */}
            <div className="w-16 h-16 border-4 border-slate-850 border-t-brand-500 rounded-full animate-spin"></div>
            <div className="absolute w-10 h-10 border-4 border-slate-850 border-b-indigo-400 rounded-full animate-spin-slow"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Verifying Your Email</h2>
            <p className="text-slate-400 text-xs font-semibold">
              Completing secure cryptographic handshake. Please wait...
            </p>
          </div>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="space-y-6 py-4">
          <div className="flex justify-center">
            <span className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl shadow-lg shadow-emerald-500/5 flex items-center justify-center">
              <CheckCircle className="w-12 h-12" />
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Verification Successful!</h2>
            <p className="text-slate-400 text-xs font-semibold px-4">
              Your candidate profile has been activated successfully. You are now authorized to schedule and manage your interview rounds.
            </p>
          </div>
          
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 py-3.5 px-5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-2xl transition-all shadow-lg shadow-brand-500/10 active:scale-[0.98]"
          >
            Go to Login
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      );
    }

    // Default: Error / Expired state
    return (
      <div className="space-y-6 py-4">
        <div className="flex justify-center">
          <span className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl shadow-lg shadow-rose-500/5 flex items-center justify-center">
            <AlertCircle className="w-12 h-12" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-white tracking-tight">Verification Failed</h2>
          <p className="text-rose-400 text-xs font-semibold leading-relaxed px-4">
            {error || "The activation token is invalid, corrupt, or has expired."}
          </p>
          <p className="text-slate-500 text-[10px] font-semibold pt-1">
            Verification links expire after 24 hours. Please re-register or contact support.
          </p>
        </div>

        {/* Resend verification block inside the error display */}
        <div className="mt-4 p-4 border border-slate-800/85 bg-slate-950/40 rounded-2xl space-y-2 text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resend Activation Link</p>
          <div className="flex gap-2">
            <input
              type="email"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="your-email@example.com"
              className="flex-grow px-3 py-2 text-xs bg-slate-900 border border-slate-800/50 text-white rounded-xl focus:border-brand-500 outline-none placeholder:text-slate-600 font-semibold"
            />
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="px-3.5 py-2 text-xs font-extrabold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all disabled:bg-slate-800 cursor-pointer outline-none"
            >
              {resendLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/register"
            className="flex-1 py-3 px-4 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-2xl transition-all text-center"
          >
            Register Again
          </Link>
          <Link
            to="/login"
            className="flex-1 py-3 px-4 text-xs font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-2xl transition-all text-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 sm:px-6">
      
      {/* Background Ambient Tints */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/75 border border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl animate-fade-in relative z-10">
        
        {/* Banner */}
        <div className="bg-gradient-to-tr from-brand-700/80 to-brand-500/80 p-6 text-center border-b border-slate-800/80">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-white font-black text-lg backdrop-blur-md mb-2 border border-white/10 shadow-inner">
            IH
          </span>
          <h1 className="text-lg font-black tracking-tight text-white">InterviewHub</h1>
        </div>

        {/* Dynamic Card Body */}
        <div className="p-8">
          {renderContent()}
        </div>

      </div>

    </div>
  );
};

export default VerifyEmail;

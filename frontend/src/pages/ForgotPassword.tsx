import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { ForgotPasswordSchema } from "../lib/schemas";
import { Mail, ArrowLeft, KeyRound, ShieldAlert } from "lucide-react";

export const ForgotPassword: React.FC = () => {
  const { requestPasswordReset, loading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      clearError();
      const msg = await requestPasswordReset(data.email);
      addToast(msg, "success");
      navigate("/login");
    } catch (err: any) {
      addToast(err.response?.data?.error || err.response?.data?.detail || "Failed to request password reset link.", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 sm:px-6">
      
      {/* Background Ambient Tints */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/75 border border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl animate-fade-in relative z-10">
        
        {/* Banner */}
        <div className="bg-gradient-to-tr from-brand-700/80 to-brand-500/80 p-8 text-center border-b border-slate-800/80">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white font-black text-xl backdrop-blur-md mb-3 border border-white/10 shadow-inner">
            IH
          </span>
          <h1 className="text-2xl font-black tracking-tight text-white">Reset Password</h1>
          <p className="text-brand-200 text-xs mt-1 font-semibold">Enter your email to receive a recovery link.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          
          {/* Error Alert Box */}
          {error && (
            <div className="flex items-center gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="email"
                {...register("email")}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-white rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-500 font-semibold"
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.email.message as string}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:from-brand-800/80 disabled:to-indigo-800/80 rounded-2xl transition-all shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            Send Reset Link
          </button>

          {/* Registration Redirect */}
          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-xs font-bold transition-all">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>

        </form>

      </div>

    </div>
  );
};

export default ForgotPassword;

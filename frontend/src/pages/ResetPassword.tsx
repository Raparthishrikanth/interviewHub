import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { ResetPasswordSchema } from "../lib/schemas";
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert, ArrowLeft } from "lucide-react";

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { resetPassword, loading, error, clearError } = useAuthStore();
  const { addToast } = useUIStore();


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (!token) {
      addToast("Reset token is missing or invalid.", "error");
      return;
    }
    try {
      clearError();
      const msg = await resetPassword(token, data.password);
      addToast(msg, "success");
      setIsSuccess(true);
    } catch (err: any) {
      addToast(err.response?.data?.error || err.response?.data?.detail || "Failed to reset password.", "error");
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 sm:px-6">
        <div className="w-full max-w-md bg-slate-900/75 border border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl p-8 text-center space-y-6 relative z-10">
          <div className="flex justify-center">
            <span className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl shadow-lg flex items-center justify-center">
              <ShieldAlert className="w-12 h-12" />
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Invalid Reset Link</h2>
            <p className="text-slate-400 text-xs font-semibold px-4">
              The password reset token is missing from the link. Please request a new recovery link.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-flex w-full items-center justify-center gap-2 py-3.5 px-5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700/80 rounded-2xl transition-all"
          >
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4 sm:px-6">
        <div className="w-full max-w-md bg-slate-900/75 border border-slate-800/80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl p-8 text-center space-y-6 relative z-10">
          <div className="flex justify-center">
            <span className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl shadow-lg flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12" />
            </span>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">Password Reset Complete</h2>
            <p className="text-slate-400 text-xs font-semibold px-4">
              Your password has been changed successfully. You can now use your new password to sign in to your portal.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex w-full items-center justify-center gap-2 py-3.5 px-5 text-sm font-bold text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 rounded-2xl transition-all shadow-lg shadow-brand-500/10"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-black tracking-tight text-white">New Password</h1>
          <p className="text-brand-200 text-xs mt-1 font-semibold">Enter your secure new password details.</p>
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

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full pl-10 pr-12 py-3 text-sm bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-white rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-500 font-semibold"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password.message as string}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Confirm New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="w-full pl-10 pr-12 py-3 text-sm bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-white rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-500 font-semibold"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.confirmPassword.message as string}</p>
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
              <CheckCircle2 className="w-4 h-4" />
            )}
            Update Password
          </button>

          {/* Registration Redirect */}
          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-xs font-bold transition-all">
              <ArrowLeft className="w-4 h-4" />
              Cancel & Back to Login
            </Link>
          </div>

        </form>

      </div>

    </div>
  );
};

export default ResetPassword;

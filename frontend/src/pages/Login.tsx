import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { LoginSchema } from "../lib/schemas";
import { Mail, Lock, LogIn, ShieldAlert } from "lucide-react";

export const Login: React.FC = () => {
  const { login, isAuthenticated, user, loading, error, clearError, resendVerificationEmail } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [resendLoading, setResendLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");

  const handleResendVerification = async () => {
    if (!emailValue) {
      addToast("Please enter your email address first.", "error");
      return;
    }
    setResendLoading(true);
    try {
      const msg = await resendVerificationEmail(emailValue);
      addToast(msg, "success");
    } catch (err: any) {
      addToast(err.response?.data?.error || err.response?.data?.detail || "Failed to resend verification email.", "error");
    } finally {
      setResendLoading(false);
    }
  };

  // If already authenticated, redirect to appropriate path
  if (isAuthenticated && user) {
    if (user.role === "CANDIDATE") {
      return <Navigate to="/my-schedule" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  const onSubmit = async (data: any) => {
    try {
      clearError();
      await login(data);
      addToast("Successfully logged in!", "success");
      // Redirect takes place automatically or via useEffect, but let's push route:
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.role === "CANDIDATE") {
        navigate("/my-schedule");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      addToast("Login failed. Check credentials.", "error");
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
          <h1 className="text-2xl font-black tracking-tight text-white">InterviewHub</h1>
          <p className="text-brand-200 text-xs mt-1 font-semibold">Schedule and manage candidate interviews in real-time.</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          
          {/* Error Alert Box */}
          {error && (
            <div className="flex flex-col gap-2 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-semibold">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              {error.toLowerCase().includes("verify your email") && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="text-left text-brand-400 hover:text-brand-300 font-bold transition-all underline mt-1 disabled:text-slate-500 w-fit cursor-pointer outline-none"
                >
                  {resendLoading ? "Resending link..." : "Resend email verification link"}
                </button>
              )}
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
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.email.message as string}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Password
              </label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="password"
                {...register("password")}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-950/60 border border-slate-800 hover:border-slate-700 text-white rounded-2xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-500 font-semibold"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-rose-400 text-xs mt-1 font-medium">{errors.password.message as string}</p>
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
              <LogIn className="w-4 h-4" />
            )}
            Sign In
          </button>

          {/* Registration Redirect */}
          <div className="text-center pt-2">
            <p className="text-slate-500 text-xs font-semibold">
              Applying for a role?{" "}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-bold transition-all">
                Register as Candidate
              </Link>
            </p>
          </div>

        </form>

      </div>

    </div>
  );
};
export default Login;

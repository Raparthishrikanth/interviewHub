import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";
import { LogOut, Calendar, ClipboardList, Megaphone, LayoutDashboard, PhoneCall, Menu, X } from "lucide-react";
import { useUIStore } from "../stores/useUIStore";

export const Topbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { openModal } = useUIStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  // Custom Navigation Links based on active User Role
  const renderNavLinks = (onLinkClick?: () => void) => {
    if (user.role === "ADMIN") {
      return (
        <>
          <Link
            to="/dashboard"
            onClick={onLinkClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/dashboard")
                ? "bg-brand-50 text-brand-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link
            to="/interviews"
            onClick={onLinkClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/interviews")
                ? "bg-brand-50 text-brand-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Interviews
          </Link>
          <Link
            to="/calendar"
            onClick={onLinkClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/calendar")
                ? "bg-brand-50 text-brand-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Link>
          <Link
            to="/notices"
            onClick={onLinkClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/notices")
                ? "bg-brand-50 text-brand-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Notices
          </Link>
          <Link
            to="/recruiters"
            onClick={onLinkClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/recruiters")
                ? "bg-brand-50 text-brand-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            Recruiters
          </Link>
        </>
      );
    }

    if (user.role === "CANDIDATE") {
      return (
        <>
          <Link
            to="/my-schedule"
            onClick={onLinkClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/my-schedule")
                ? "bg-brand-50 text-brand-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            My Schedule
          </Link>
          <Link
            to="/calendar"
            onClick={onLinkClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/calendar")
                ? "bg-brand-50 text-brand-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Calendar
          </Link>
          <Link
            to="/notices"
            onClick={onLinkClick}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
              isActive("/notices")
                ? "bg-brand-50 text-brand-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Notices
          </Link>
          {user.can_view_recruiters && (
            <Link
              to="/recruiters"
              onClick={onLinkClick}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                isActive("/recruiters")
                  ? "bg-brand-50 text-brand-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              Recruiters
            </Link>
          )}
        </>
      );
    }

    // Default: VIEWER role layout
    return (
      <>
        <Link
          to="/interviews"
          onClick={onLinkClick}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
            isActive("/interviews")
              ? "bg-brand-50 text-brand-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Interviews
        </Link>
        <Link
          to="/calendar"
          onClick={onLinkClick}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
            isActive("/calendar")
              ? "bg-brand-50 text-brand-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Calendar
        </Link>
        <Link
          to="/notices"
          onClick={onLinkClick}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
            isActive("/notices")
              ? "bg-brand-50 text-brand-600 shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/55"
          }`}
        >
          <Megaphone className="w-4 h-4" />
          Notices
        </Link>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Branding Logo */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold shadow-md shadow-brand-500/20">
              IH
            </span>
            <span className="text-lg font-black tracking-tight text-slate-800 hidden sm:block">
              Interview<span className="text-brand-600 font-semibold">Hub</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">{renderNavLinks()}</nav>
        </div>

        {/* Profile Pill & Action */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => openModal("profile")}
            className="flex items-center gap-2 bg-slate-100/70 hover:bg-slate-200/55 border border-slate-200/50 p-1 md:pr-3 rounded-full transition-all cursor-pointer outline-none animate-fade-in"
            title="View Profile"
          >
            {user.profile_picture ? (
              <img
                src={user.profile_picture}
                alt={user.name}
                className="h-8 w-8 object-cover rounded-full shadow-inner"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-sm shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-500 leading-none mt-0.5 uppercase tracking-wider font-semibold">
                {user.role}
              </p>
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/50 transition-all shadow-sm"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-brand-600 hover:border-brand-100 hover:bg-brand-50/50 transition-all shadow-sm cursor-pointer"
            title="Toggle Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expandable Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 space-y-3 shadow-lg animate-fade-in absolute w-full left-0 z-40">
          <nav className="flex flex-col gap-1.5">
            {renderNavLinks(() => setIsMobileMenuOpen(false))}
          </nav>
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <div className="text-left pl-2">
              <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-500 leading-none mt-1.5 uppercase tracking-wider font-semibold">
                {user.role}
              </p>
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-650 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all shadow-sm border border-rose-100"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
export default Topbar;

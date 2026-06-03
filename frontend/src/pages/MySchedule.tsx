import React, { useEffect } from "react";
import { useInterviewStore } from "../stores/useInterviewStore";
import { useUIStore } from "../stores/useUIStore";
import { Topbar } from "../components/Topbar";
import { StatusBadge } from "../components/StatusBadge";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import {
  Calendar,
  Clock,
  Video,
  User,
  Plus,
  XCircle,
  MessageSquare,
  ChevronRight,
  Info
} from "lucide-react";

import { useAuthStore } from "../stores/useAuthStore";

export const MySchedule: React.FC = () => {
  const { interviews, fetchInterviews, cancelInterview } = useInterviewStore();
  const { openModal, addToast } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const myInterviews = interviews.filter((interview) => interview.candidate?.id === user?.id);

  const handleCancel = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this interview request? This cannot be undone.")) {
      try {
        await cancelInterview(id);
        addToast("Interview request successfully cancelled.", "success");
      } catch (err: any) {
        addToast(err.message || "Failed to cancel interview request.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />

      <main className="flex-grow mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 space-y-6">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">My Interview Schedule</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your scheduled rounds, comments thread, and meeting invites.</p>
          </div>
          <button
            onClick={() => openModal("create_interview")}
            className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10 self-start sm:self-auto"
          >
            <Plus className="w-4.5 h-4.5" />
            Schedule Interview
          </button>
        </div>

        {/* Notice Info Banner */}
        <div className="p-4 bg-brand-50/60 border border-brand-100/50 rounded-2xl flex gap-3">
          <Info className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-brand-800 leading-relaxed font-semibold">
            You can modify or schedule new rounds directly. Interviewers, calendar invitations (`.ics`), and meeting links will be updated in real-time by system administrators upon confirmation.
          </p>
        </div>

        {/* Schedule Grid */}
        <div className="space-y-4">
          {myInterviews.map((interview) => {
            const isPending = interview.status === "PENDING";
            return (
              <div
                key={interview.id}
                className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-premium hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
              >
                
                {/* Details left */}
                <div className="space-y-3 flex-grow">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wide">
                      {interview.type}
                    </h3>
                    <StatusBadge status={interview.status} />
                  </div>
                  
                  <p className="text-sm font-bold text-slate-500">
                    Role: <span className="text-slate-800 font-extrabold">{interview.role}</span>
                    {interview.department && ` &bull; ${interview.department}`}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(interview.date).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(interview.date).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit"
                      })} ({interview.duration_min} min)
                    </span>
                    {interview.interviewer && (
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4 text-slate-400" />
                        Interviewer: {interview.interviewer}
                      </span>
                    )}
                  </div>

                  {/* Join Room */}
                  {interview.meeting_link && (
                    <div className="pt-2">
                      <a
                         href={interview.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-all"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Zoom Room
                      </a>
                    </div>
                  )}

                </div>

                {/* Actions right */}
                <div className="flex sm:flex-col items-start sm:items-end gap-2 flex-shrink-0 border-t border-slate-100 pt-4 sm:border-t-0 sm:pt-0">
                  <Link
                    to={`/interviews/${interview.id}`}
                    className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold border border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-100 hover:bg-brand-50/55 rounded-xl transition-all shadow-sm bg-white"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Discussion Thread
                    <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>
                  {isPending && (
                    <button
                      onClick={() => handleCancel(interview.id)}
                      className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl transition-all shadow-sm bg-white"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel Request
                    </button>
                  )}
                </div>

              </div>
            );
          })}
          {myInterviews.length === 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-16 text-center shadow-premium">
              <p className="text-slate-400 text-sm font-semibold">
                No interviews scheduled yet. Request your first round!
              </p>
              <button
                onClick={() => openModal("create_interview")}
                className="mt-4 inline-flex items-center gap-1 px-4 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10"
              >
                Schedule First Interview
              </button>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
};
export default MySchedule;

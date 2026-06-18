import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useInterviewStore } from "../stores/useInterviewStore";
import { useCommentStore } from "../stores/useCommentStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { Topbar } from "../components/Topbar";
import { StatusBadge } from "../components/StatusBadge";
import { Footer } from "../components/Footer";
import { useRecruiterStore } from "../stores/useRecruiterStore";
import {
  Calendar,
  Video,
  User,
  MessageSquare,
  ArrowLeft,
  Trash2,
  Send,
  History,
  Info,
  ShieldCheck,
  ShieldX
} from "lucide-react";

export const InterviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { selectedInterview, fetchInterviewDetail, updateStatus } = useInterviewStore();
  const { comments, fetchComments, addComment, deleteComment } = useCommentStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const { toggleCandidateAccess } = useRecruiterStore();
  const navigate = useNavigate();

  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInterviewDetail(id).catch(() => {
        addToast("Permission denied or interview not found.", "error");
        const target = user?.role === "CANDIDATE" ? "/my-schedule" : (user?.role === "VIEWER" ? "/interviews" : "/dashboard");
        navigate(target);
      });
      fetchComments(id);
    }
  }, [id, fetchInterviewDetail, fetchComments, addToast, navigate, user]);

  if (!selectedInterview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;

    setCommentLoading(true);
    try {
      await addComment(id, commentText.trim());
      setCommentText("");
      addToast("Comment posted.", "success");
      // Refetch comments to refresh thread
      fetchComments(id);
    } catch (err: any) {
      addToast(err.message || "Failed to post comment.", "error");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm("Delete this comment permanently?")) {
      try {
        if (id) {
          await deleteComment(id, commentId);
          addToast("Comment deleted.", "success");
          fetchComments(id);
        }
      } catch (err) {
        addToast("Failed to delete comment.", "error");
      }
    }
  };

  const handleAdminStatusChange = async (newStatus: string) => {
    if (id) {
      try {
        await updateStatus(id, newStatus);
        addToast(`Interview status set to ${newStatus}.`, "success");
        fetchInterviewDetail(id); // Reload logs
      } catch (err: any) {
        addToast(err.message || "Status change failed.", "error");
      }
    }
  };

  const handleToggleRecruiterAccess = async () => {
    if (selectedInterview?.candidate?.id) {
      try {
        await toggleCandidateAccess(selectedInterview.candidate.id, !selectedInterview.candidate.can_view_recruiters);
        addToast("Candidate recruiter access updated successfully!", "success");
        if (id) {
          fetchInterviewDetail(id);
        }
      } catch (err) {
        addToast("Failed to update candidate access.", "error");
      }
    }
  };

  const isAdmin = user?.role === "ADMIN";
  const isViewer = user?.role === "VIEWER";
  const canComment = !isViewer;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Back navigation line */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </button>
        </div>

        {/* Content Columns split: Left core data, Right details sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Core Column (Detail info + Comments Feed) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Main Card */}
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-premium space-y-6">
              
              {/* Header block */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-slate-100 pb-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                      {selectedInterview.candidate?.name}
                    </h2>
                    {isAdmin && selectedInterview.candidate && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold shadow-sm">
                        <span className="text-slate-500">Recruiter Directory Access:</span>
                        <button
                          type="button"
                          onClick={handleToggleRecruiterAccess}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                            selectedInterview.candidate.can_view_recruiters ? "bg-brand-600" : "bg-slate-200"
                          }`}
                          role="switch"
                          aria-checked={selectedInterview.candidate.can_view_recruiters}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              selectedInterview.candidate.can_view_recruiters ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="w-16">
                          {selectedInterview.candidate.can_view_recruiters ? (
                            <span className="text-brand-600 flex items-center gap-0.5">
                              <ShieldCheck className="w-3.5 h-3.5" /> Allowed
                            </span>
                          ) : (
                            <span className="text-slate-400 flex items-center gap-0.5">
                              <ShieldX className="w-3.5 h-3.5" /> Locked
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-500">
                    Applying for <span className="font-bold text-slate-700">{selectedInterview.role}</span> &bull; {selectedInterview.department || "No department"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-start sm:items-end">
                  <StatusBadge status={selectedInterview.status} />
                  {isAdmin && selectedInterview.status !== "CANCELLED" && selectedInterview.status !== "COMPLETED" && (
                    <select
                      value={selectedInterview.status}
                      onChange={(e) => handleAdminStatusChange(e.target.value)}
                      className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-1.5 outline-none focus:border-brand-500 mt-1"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="RESCHEDULED">RESCHEDULED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Time Coordinate */}
                <div className="flex gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</h5>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {new Date(selectedInterview.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {new Date(selectedInterview.date).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit"
                      })} ({selectedInterview.duration_min} mins)
                    </p>
                  </div>
                </div>

                {/* Interview Coordinator */}
                <div className="flex gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interviewer & Mode</h5>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {selectedInterview.interviewer || "Not yet assigned"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 uppercase font-semibold">
                      {selectedInterview.mode} MODE
                    </p>
                  </div>
                </div>

              </div>

              {/* Call Details / Meeting Link */}
              {selectedInterview.meeting_link && (
                <div className="p-4 bg-brand-50/65 border border-brand-100 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Video className="w-5 h-5 text-brand-600" />
                    <div>
                      <h6 className="text-xs font-bold text-brand-800">Meeting Room Ready</h6>
                      <p className="text-[11px] text-brand-600 mt-0.5 truncate max-w-md">{selectedInterview.meeting_link}</p>
                    </div>
                  </div>
                  <a
                    href={selectedInterview.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-all shadow-sm flex-shrink-0"
                  >
                    Join Interview Room
                  </a>
                </div>
              )}

              {/* Notes */}
              {selectedInterview.notes && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interview Notes</h5>
                  <p className="text-slate-600 text-sm bg-slate-50 border border-slate-100 p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                    {selectedInterview.notes}
                  </p>
                </div>
              )}

            </div>

            {/* Comments Discussion Card */}
            <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-premium space-y-6">
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-500" />
                Comments Thread
              </h3>

              {/* Discussion List */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                {comments.map((comment) => {
                  const isAuthor = user?.id === comment.author?.id;
                  const canDelete = isAdmin || isAuthor;
                  return (
                    <div key={comment.id} className="flex gap-3 items-start animate-fade-in">
                      {comment.author?.profile_picture ? (
                        <img
                          src={comment.author.profile_picture}
                          alt={comment.author.name}
                          className="h-8 w-8 rounded-full object-cover flex-shrink-0 mt-0.5 shadow-sm border border-slate-100"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex-shrink-0 shadow-sm mt-0.5">
                          {comment.author?.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="flex-grow bg-slate-50 border border-slate-150/60 p-3 rounded-2xl relative">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-slate-800">{comment.author?.name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(comment.created_at).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>

                        {/* Delete Comment Option */}
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="absolute right-3 bottom-3 p-1 text-slate-300 hover:text-rose-600 transition-colors rounded"
                            title="Delete comment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {comments.length === 0 && (
                  <p className="text-center text-slate-400 text-sm font-semibold py-8">
                    No comments yet. Start the conversation!
                  </p>
                )}
              </div>

              {/* Comment submit Box */}
              {canComment && (
                <form onSubmit={handlePostComment} className="flex items-end gap-3 border-t border-slate-100 pt-5">
                  <div className="flex-grow">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-none"
                      placeholder="Post questions, coordination details, or notes..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={commentLoading || !commentText.trim()}
                    className="p-3 text-white bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl transition-all shadow-md shadow-brand-500/10 h-[42px] flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

            </div>

          </div>

          {/* Right Sidebar (History logs / Audits) */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-premium space-y-6">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 border-b border-slate-100 pb-4">
              <History className="w-4.5 h-4.5 text-slate-500" />
              Activity Feed & Audit Log
            </h3>

            {/* Audit log items */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {selectedInterview.history?.map((log) => (
                <div key={log.id} className="relative pl-5 border-l border-slate-200 space-y-1 py-0.5">
                  <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-brand-200 border-2 border-white rounded-full"></span>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">{log.message}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    <span>{log.actor_name}</span>
                    <span>&bull;</span>
                    <span>
                      {new Date(log.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {(!selectedInterview.history || selectedInterview.history.length === 0) && (
                <p className="text-center text-slate-400 text-xs italic py-4">No audit logs recorded.</p>
              )}
            </div>

            <div className="p-4 bg-slate-50/70 border border-slate-150/50 rounded-xl flex gap-2">
              <Info className="w-4.5 h-4.5 text-slate-400 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-slate-500 leading-normal font-semibold">
                History logs are generated automatically on critical transitions (e.g., status-changes, comment additions, deletions) to provide a complete audit trial.
              </p>
            </div>

          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
};
export default InterviewDetail;

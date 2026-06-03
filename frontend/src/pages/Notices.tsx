import React, { useEffect, useState } from "react";
import { useNoticeStore } from "../stores/useNoticeStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { useNoticeCommentStore } from "../stores/useNoticeCommentStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateNoticeSchema } from "../lib/schemas";
import { Topbar } from "../components/Topbar";
import { Footer } from "../components/Footer";
import {
  Megaphone,
  Trash2,
  AlertTriangle,
  Plus,
  Send,
  Calendar,
  User,
  Tag,
  X,
  MessageSquare
} from "lucide-react";

export const Notices: React.FC = () => {
  const { notices, fetchNotices, createNotice, deleteNotice } = useNoticeStore();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedNotices, setExpandedNotices] = useState<Record<string, boolean>>({});
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});

  const { commentsByNotice, fetchComments, addComment, deleteComment } = useNoticeCommentStore();

  const toggleComments = (noticeId: string) => {
    const isExpanded = !!expandedNotices[noticeId];
    setExpandedNotices((prev) => ({ ...prev, [noticeId]: !isExpanded }));
    if (!isExpanded) {
      fetchComments(noticeId);
    }
  };

  const handlePostComment = async (noticeId: string) => {
    const text = commentTexts[noticeId]?.trim();
    if (!text) return;

    try {
      await addComment(noticeId, text);
      setCommentTexts((prev) => ({ ...prev, [noticeId]: "" }));
      addToast("Comment posted.", "success");
    } catch (err: any) {
      addToast(err.message || "Failed to post comment.", "error");
    }
  };

  const handleDeleteComment = async (noticeId: string, commentId: string) => {
    if (window.confirm("Delete this comment permanently?")) {
      try {
        await deleteComment(noticeId, commentId);
        addToast("Comment deleted.", "success");
      } catch (err) {
        addToast("Failed to delete comment.", "error");
      }
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateNoticeSchema),
    defaultValues: {
      title: "",
      body: "",
      type: "GENERAL" as const,
      priority: "MEDIUM" as const,
    },
  });

  const isAdmin = user?.role === "ADMIN";

  const onSubmit = async (data: any) => {
    try {
      await createNotice(data);
      addToast("Announcement published successfully!", "success");
      reset();
      setShowCreateForm(false);
      fetchNotices(); // Reload listings
    } catch (err) {
      addToast("Failed to publish notice.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this notice permanently?")) {
      try {
        await deleteNotice(id);
        addToast("Notice announcement deleted.", "success");
        fetchNotices();
      } catch (err) {
        addToast("Failed to delete notice.", "error");
      }
    }
  };

  const cardPriorities = {
    HIGH: "border-rose-200 bg-rose-50/20 text-rose-800 ring-1 ring-rose-500/10",
    MEDIUM: "border-amber-250 bg-amber-50/10 text-amber-800 ring-1 ring-amber-500/5",
    LOW: "border-slate-200 bg-white text-slate-700",
  };

  const priorityBadges = {
    HIGH: "bg-rose-500 text-white shadow-sm shadow-rose-500/10",
    MEDIUM: "bg-amber-500 text-white shadow-sm shadow-amber-500/10",
    LOW: "bg-slate-400 text-white",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />

      <main className="flex-grow mx-auto max-w-4xl w-full px-4 sm:px-6 py-8 space-y-6">
        
        {/* Title Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Notice Board</h1>
            <p className="text-slate-500 text-sm mt-0.5">Explore company alerts, scheduler operations updates, and announcements.</p>
          </div>
          {isAdmin && !showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10"
            >
              <Plus className="w-4.5 h-4.5" />
              Publish Announcement
            </button>
          )}
        </div>

        {/* Admin Publish Card Form */}
        {isAdmin && showCreateForm && (
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-premium relative animate-fade-in space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">Publish Announcement</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Notice Title
                </label>
                <input
                  type="text"
                  {...register("title")}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  placeholder="System Maintenance Scheduled or Holiday Alert..."
                />
                {errors.title && (
                  <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.title.message as string}</p>
                )}
              </div>

              {/* Priority and Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Category Type
                  </label>
                  <select
                    {...register("type")}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white outline-none transition-all"
                  >
                    <option value="GENERAL">GENERAL</option>
                    <option value="REMINDER">REMINDER</option>
                    <option value="UPDATE">UPDATE</option>
                    <option value="IMPORTANT">IMPORTANT</option>
                    <option value="HOLIDAY">HOLIDAY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Priority Level
                  </label>
                  <select
                    {...register("priority")}
                    className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white outline-none transition-all"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </select>
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Message Body
                </label>
                <textarea
                  {...register("body")}
                  rows={4}
                  className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-none"
                  placeholder="Provide all relevant details here..."
                />
                {errors.body && (
                  <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.body.message as string}</p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10"
                >
                  <Send className="w-4 h-4" />
                  Publish Announcement
                </button>
              </div>

            </form>
          </div>
        )}

        {/* Notices Grid list */}
        <div className="grid grid-cols-1 gap-5">
          {notices.map((notice) => {
            const isHigh = notice.priority === "HIGH";
            return (
              <div
                key={notice.id}
                className={`border p-6 rounded-3xl shadow-premium flex flex-col justify-between relative group hover:border-slate-300 transition-all ${
                  cardPriorities[notice.priority] || cardPriorities.LOW
                }`}
              >
                
                {/* Delete button (Admin only) */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="absolute right-6 top-6 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all rounded-xl"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}

                {/* Content */}
                <div className="space-y-4 pr-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      priorityBadges[notice.priority]
                    }`}>
                      {notice.priority}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 rounded-full uppercase tracking-wider">
                      <Tag className="w-3 h-3" />
                      {notice.type}
                    </span>
                    {isHigh && (
                      <span className="flex items-center gap-0.5 text-rose-600 text-[10px] font-extrabold animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Important
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-black tracking-tight text-slate-800 leading-snug">
                    {notice.title}
                  </h3>

                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {notice.body}
                  </p>
                </div>

                {/* Meta details footer */}
                <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-400 border-t border-slate-150/40 mt-5 pt-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Published by {notice.author?.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(notice.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => toggleComments(notice.id)}
                    className="inline-flex items-center gap-1 font-bold text-brand-600 hover:text-brand-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Comments ({(notice as any).comments?.length || 0})
                  </button>
                </div>

                {/* Expandable Comments Thread */}
                {expandedNotices[notice.id] && (
                  <div className="mt-5 border-t border-slate-100 pt-5 space-y-4 animate-fade-in">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      Discussion Board
                    </h4>

                    {/* Scrollable comments list */}
                    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                      {(commentsByNotice[notice.id] || []).map((comment) => {
                        const isAuthor = user?.id === comment.author?.id;
                        const canDelete = isAdmin || isAuthor;
                        return (
                          <div key={comment.id} className="flex gap-2.5 items-start text-xs animate-fade-in">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-black flex-shrink-0 mt-0.5 shadow-sm">
                              {comment.author?.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="flex-grow bg-slate-50 border border-slate-150 p-2.5 rounded-2xl relative">
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-bold text-slate-800">{comment.author?.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {new Date(comment.created_at).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <p className="text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">{comment.text}</p>

                              {/* Delete Comment */}
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteComment(notice.id, comment.id)}
                                  className="absolute right-2.5 bottom-2.5 p-1 text-slate-350 hover:text-rose-600 transition-colors rounded hover:bg-rose-50"
                                  title="Delete comment"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(commentsByNotice[notice.id] || []).length === 0 && (
                        <p className="text-center text-slate-400 text-xs italic py-4">
                          No comments posted yet.
                        </p>
                      )}
                    </div>

                    {/* Comment Input Form */}
                    {user?.role !== "VIEWER" && (
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <input
                          type="text"
                          value={commentTexts[notice.id] || ""}
                          onChange={(e) => setCommentTexts((prev) => ({ ...prev, [notice.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handlePostComment(notice.id);
                            }
                          }}
                          className="flex-grow px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all bg-white"
                          placeholder="Write a comment..."
                        />
                        <button
                          onClick={() => handlePostComment(notice.id)}
                          disabled={!(commentTexts[notice.id]?.trim())}
                          className="p-2 text-white bg-brand-600 hover:bg-brand-700 disabled:bg-slate-250 disabled:text-slate-400 rounded-xl transition-all shadow-sm shadow-brand-500/10 flex items-center justify-center h-[32px] w-[32px]"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            );
          })}
          {notices.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-premium flex flex-col items-center justify-center gap-3">
              <Megaphone className="w-10 h-10 text-slate-300" />
              <p className="text-slate-400 text-sm font-semibold">
                No announcement postings currently published.
              </p>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </div>
  );
};
export default Notices;

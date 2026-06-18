import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUIStore } from "../stores/useUIStore";
import { useInterviewStore } from "../stores/useInterviewStore";
import { useAuthStore } from "../stores/useAuthStore";
import { CreateInterviewSchema } from "../lib/schemas";
import { X, Calendar, Video, Clock, Briefcase, Mail } from "lucide-react";
import { api } from "../lib/axios";

export const InterviewModal: React.FC = () => {
  const { activeModal, modalData, closeModal, addToast } = useUIStore();
  const { createInterview, updateInterview, loading } = useInterviewStore();
  const { user } = useAuthStore();

  const isEdit = activeModal === "edit_interview";
  const isOpen = activeModal === "create_interview" || isEdit;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateInterviewSchema),
    defaultValues: {
      candidate_email: "",
      role: "",
      department: "",
      type: "TECHNICAL",
      mode: "ONLINE",
      category: "",
      date: "",
      duration_min: 60,
      interviewer: "",
      interview_handler: "",
      meeting_link: "",
      notes: "",
    },
  });

  const [categories, setCategories] = useState<{ id: string; type: string; name: string }[]>([]);
  const selectedType = watch("type");

  // Fetch categories when the modal opens
  useEffect(() => {
    if (isOpen) {
      api.get("/interviews/categories/")
        .then((res) => {
          const data = Array.isArray(res.data) 
            ? res.data 
            : (Array.isArray(res.data?.results) ? res.data.results : []);
          setCategories(data);
        })
        .catch((err) => {
          console.error("Failed to fetch categories:", err);
        });
    }
  }, [isOpen]);

  const filteredCategories = categories.filter((c) => c.type === selectedType);

  // Hydrate fields if editing or pre-filling for Candidate
  useEffect(() => {
    if (isOpen) {
      if (isEdit && modalData) {
        // Format ISO date to datetime-local format (YYYY-MM-DDTHH:MM)
        let formattedDate = "";
        if (modalData.date) {
          const d = new Date(modalData.date);
          formattedDate = d.toISOString().slice(0, 16);
        }

        reset({
          candidate_email: modalData.candidate?.email || "",
          role: modalData.role || "",
          department: modalData.department || "",
          type: modalData.type || "TECHNICAL",
          mode: modalData.mode || "ONLINE",
          category: modalData.category || "",
          date: formattedDate,
          duration_min: modalData.duration_min || 60,
          interviewer: modalData.interviewer || "",
          interview_handler: modalData.interview_handler || "",
          meeting_link: modalData.meeting_link || "",
          notes: modalData.notes || "",
        });
      } else {
        // Create Mode
        reset({
          candidate_email: user?.role === "CANDIDATE" ? user.email : "",
          role: "",
          department: "",
          type: "TECHNICAL",
          mode: "ONLINE",
          category: "",
          date: "",
          duration_min: 60,
          interviewer: "",
          interview_handler: "",
          meeting_link: "",
          notes: "",
        });
      }
    }
  }, [isOpen, isEdit, modalData, reset, user]);

  if (!isOpen) return null;

  const onSubmit = async (data: any) => {
    try {
      if (isEdit && modalData) {
        await updateInterview(modalData.id, data);
        addToast("Interview updated successfully!", "success");
      } else {
        await createInterview(data);
        addToast("Interview scheduled successfully!", "success");
      }
      closeModal();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Operation failed.";
      addToast(msg, "error");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800">
              {isEdit ? "Reschedule / Edit Interview" : "Schedule New Interview"}
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Provide the interview structure, dates, and communication coordinates.
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-grow overflow-y-auto p-6 space-y-6">
          
          {/* Candidate Email (Only shown to admin/scheduler, hidden for candidates) */}
          {user?.role !== "CANDIDATE" && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Candidate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  {...register("candidate_email")}
                  disabled={isEdit}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-slate-50/50 disabled:bg-slate-100 disabled:text-slate-500 outline-none transition-all"
                  placeholder="candidate@example.com"
                />
              </div>
              {errors.candidate_email && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.candidate_email.message as string}</p>
              )}
            </div>
          )}

          {/* Role and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Target Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  {...register("role")}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  placeholder="Fullstack Engineer"
                />
              </div>
              {errors.role && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.role.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Department
              </label>
              <input
                type="text"
                {...register("department")}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                placeholder="Engineering"
              />
              {errors.department && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.department.message as string}</p>
              )}
            </div>
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Interview Type
              </label>
              <select
                {...register("type")}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white outline-none transition-all"
              >
                <option value="TECHNICAL">TECHNICAL</option>
                <option value="HR">HR</option>
                <option value="MANAGERIAL">MANAGERIAL</option>
                <option value="CULTURE_FIT">CULTURE FIT</option>
                <option value="FINAL_ROUND">FINAL ROUND</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Interview Category / Round
              </label>
              <select
                {...register("category")}
                disabled={filteredCategories.length === 0}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white disabled:bg-slate-50 disabled:text-slate-400 outline-none transition-all"
              >
                {filteredCategories.length === 0 ? (
                  <option value="">General</option>
                ) : (
                  <>
                    <option value="">Select Category / Round</option>
                    {filteredCategories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {errors.category && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.category.message as string}</p>
              )}
            </div>
          </div>

          {/* Mode and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Interview Mode
              </label>
              <select
                {...register("mode")}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white outline-none transition-all"
              >
                <option value="ONLINE">ONLINE</option>
                <option value="IN_PERSON">IN_PERSON</option>
                <option value="PHONE">PHONE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Duration (minutes)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  {...register("duration_min")}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  placeholder="60"
                />
              </div>
              {errors.duration_min && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.duration_min.message as string}</p>
              )}
            </div>
          </div>

          {/* Date & Time and Meeting Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Date & Time
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="datetime-local"
                  {...register("date")}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                />
              </div>
              {errors.date && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.date.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Meeting Link
              </label>
              <div className="relative">
                <Video className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  {...register("meeting_link")}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500 outline-none transition-all"
                  placeholder="https://zoom.us/j/..."
                />
              </div>
              {errors.meeting_link && (
                <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.meeting_link.message as string}</p>
              )}
            </div>
          </div>

          {/* Interviewer Name and Interview Handler Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Interviewer Name
              </label>
              <input
                type="text"
                {...register("interviewer")}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500 outline-none transition-all"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Interview Handler Name
              </label>
              <input
                type="text"
                {...register("interview_handler")}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-500 outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pre-Interview Notes / Requests
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-none"
              placeholder="Provide background info or special requests..."
            />
            {errors.notes && (
              <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.notes.message as string}</p>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 bg-slate-50/20 -mx-6 -mb-6 p-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center gap-1.5"
            >
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
              {isEdit ? "Save Changes" : "Schedule Round"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
export default InterviewModal;

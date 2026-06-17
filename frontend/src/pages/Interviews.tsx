import React, { useEffect, useState } from "react";
import { useInterviewStore } from "../stores/useInterviewStore";
import { useUIStore } from "../stores/useUIStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Topbar } from "../components/Topbar";
import { StatusBadge } from "../components/StatusBadge";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import {
  Search,
  Trash2,
  Edit,
  Video,
  FileSpreadsheet,
  Eye
} from "lucide-react";

export const Interviews: React.FC = () => {
  const { interviews, loading, fetchInterviews, deleteInterview, updateStatus } = useInterviewStore();
  const { openModal, addToast } = useUIStore();
  const { user } = useAuthStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const isAdmin = user?.role === "ADMIN";

  // Refetch when filters shift
  useEffect(() => {
    const params: Record<string, any> = {};
    if (search.trim()) params.search = search.trim();
    if (statusFilter) params.status = statusFilter;
    if (typeFilter) params.type = typeFilter;

    fetchInterviews(params);
  }, [search, statusFilter, typeFilter, fetchInterviews]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this interview record? This cascades to comments and logs.")) {
      try {
        await deleteInterview(id);
        addToast("Interview record deleted.", "success");
      } catch (err: any) {
        addToast("Delete operation failed.", "error");
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateStatus(id, newStatus);
      addToast(`Status updated to ${newStatus}`, "success");
    } catch (err: any) {
      addToast(err.message || "Failed to update status", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Title Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Interview Directory</h1>
            <p className="text-slate-500 text-sm mt-0.5">Explore, search, filter, and export scheduled interview rounds.</p>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <a
                href="http://localhost:8000/api/interviews/export/"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Export CSV
              </a>
              <button
                onClick={() => openModal("create_interview")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10"
              >
                Schedule Round
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Panel */}
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-premium grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all placeholder:text-slate-400"
              placeholder="Search candidate, role, interviewer..."
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white outline-none transition-all"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RESCHEDULED">RESCHEDULED</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white outline-none transition-all"
            >
              <option value="">All Round Types</option>
              <option value="TECHNICAL">TECHNICAL</option>
              <option value="HR">HR</option>
              <option value="MANAGERIAL">MANAGERIAL</option>
              <option value="CULTURE_FIT">CULTURE FIT</option>
              <option value="FINAL_ROUND">FINAL ROUND</option>
            </select>
          </div>
        </div>

        {/* Core Table */}
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-premium">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Candidate</th>
                  <th className="py-3.5 px-5">Role / Dept</th>
                  <th className="py-3.5 px-5">Round Type</th>
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Interviewer</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {interviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-slate-50/30 transition-colors">
                    
                    {/* Candidate */}
                    <td className="py-4 px-5">
                      <div>
                        <Link to={`/interviews/${interview.id}`} className="font-bold text-slate-800 hover:text-brand-600 transition-colors">
                          {interview.candidate?.name}
                        </Link>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{interview.candidate?.email}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-5">
                      <span className="font-semibold text-slate-700">{interview.role}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{interview.department || "N/A"}</span>
                    </td>

                    {/* Round */}
                    <td className="py-4 px-5">
                      <span className="font-bold text-slate-800">
                        {interview.type}
                        {interview.category && (
                          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-brand-50 text-brand-700 rounded-md border border-brand-100">
                            {interview.category}
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{interview.mode}</span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5">
                      <span className="font-medium text-slate-600">
                        {new Date(interview.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </td>

                    {/* Interviewer */}
                    <td className="py-4 px-5">
                      {interview.interviewer ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{interview.interviewer}</span>
                          {interview.meeting_link && (
                            <a href={interview.meeting_link} target="_blank" rel="noreferrer" className="text-[10px] text-brand-600 font-bold hover:underline flex items-center gap-0.5 mt-0.5">
                              <Video className="w-3 h-3" />
                              Join Meeting
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Not assigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      {isAdmin && interview.status !== "CANCELLED" && interview.status !== "COMPLETED" ? (
                        <select
                          value={interview.status}
                          onChange={(e) => handleStatusChange(interview.id, e.target.value)}
                          className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg p-1 outline-none focus:border-brand-500"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="RESCHEDULED">RESCHEDULED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      ) : (
                        <StatusBadge status={interview.status} />
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/interviews/${interview.id}`}
                          className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                          title="View Thread"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </Link>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openModal("edit_interview", interview)}
                              className="p-2 text-slate-400 hover:text-brand-600 rounded-xl hover:bg-brand-50 transition-colors"
                              title="Reschedule / Edit"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(interview.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
                {interviews.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-sm font-semibold text-slate-400">
                      No interviews match the active filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};
export default Interviews;

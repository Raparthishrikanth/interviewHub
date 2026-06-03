import React, { useEffect } from "react";
import { useInterviewStore } from "../stores/useInterviewStore";
import { useUIStore } from "../stores/useUIStore";
import { Topbar } from "../components/Topbar";
import { StatusBadge } from "../components/StatusBadge";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import {
  Users,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { interviews, stats, fetchInterviews, fetchStats } = useInterviewStore();
  const { openModal } = useUIStore();

  useEffect(() => {
    // Fetch initial interviews list and aggregate dashboard stats
    fetchInterviews({ limit: 5 });
    fetchStats();
  }, [fetchInterviews, fetchStats]);

  const total = stats?.total || 0;
  const pending = stats?.status_breakdown?.PENDING || 0;
  const confirmed = stats?.status_breakdown?.CONFIRMED || 0;
  const completed = stats?.status_breakdown?.COMPLETED || 0;

  // Round type ratios helper
  const renderTypeProgress = (type: string, count: number) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div key={type} className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold">
          <span className="text-slate-600 uppercase tracking-wide">{type.replace("_", " ")}</span>
          <span className="text-slate-800 font-bold">{count} ({Math.round(percentage)}%)</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* Title Welcome Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">System Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Real-time scheduling aggregates, queues, and notice boards.</p>
          </div>
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
              <Plus className="w-4.5 h-4.5" />
              Schedule Round
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-premium flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Rounds</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{total}</h3>
            </div>
            <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-premium flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approval</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{pending}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-premium flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Confirmed Slots</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{confirmed}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-slate-150 p-6 rounded-2xl shadow-premium flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Rounds</p>
              <h3 className="text-3xl font-extrabold text-slate-800 mt-1">{completed}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dynamic Details Panels Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Mini Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-premium flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800">Recent Interview Rounds</h4>
              <Link to="/interviews" className="text-brand-600 hover:text-brand-700 text-xs font-bold flex items-center gap-0.5">
                View All
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            <div className="flex-grow overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-5">Candidate</th>
                    <th className="py-3 px-5">Role / Dept</th>
                    <th className="py-3 px-5">Round / Mode</th>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {interviews.slice(0, 5).map((interview) => (
                    <tr key={interview.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div>
                          <Link to={`/interviews/${interview.id}`} className="text-sm font-bold text-slate-800 hover:text-brand-600 transition-colors block">
                            {interview.candidate?.name}
                          </Link>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{interview.candidate?.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-xs font-semibold text-slate-700">{interview.role}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{interview.department || "No department"}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-xs font-bold text-brand-600">{interview.type}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{interview.mode}</span>
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-xs font-medium text-slate-600">
                          {new Date(interview.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <StatusBadge status={interview.status} />
                      </td>
                    </tr>
                  ))}
                  {interviews.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-sm font-semibold text-slate-400">
                        No interviews scheduled. Click "Schedule Round" to begin!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Breakdown Widget */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-premium flex flex-col justify-between">
            <div>
              <h4 className="font-extrabold text-slate-800">Round Type Ratios</h4>
              <p className="text-slate-400 text-xs mt-0.5">Frequency breakdown across interview categories.</p>
              
              <div className="space-y-4 mt-6">
                {Object.entries(stats?.type_breakdown || {}).map(([type, count]) =>
                  renderTypeProgress(type, count)
                )}
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Database Sync</span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                Connected
              </span>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
};
export default Dashboard;

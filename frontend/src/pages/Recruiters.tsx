import React, { useEffect, useState } from "react";
import { useRecruiterStore } from "../stores/useRecruiterStore";
import type { Recruiter } from "../stores/useRecruiterStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useUIStore } from "../stores/useUIStore";
import { Topbar } from "../components/Topbar";
import { Footer } from "../components/Footer";
import {
  PhoneCall,
  Building,
  Search,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  LockKeyhole,
  Users,
  Clipboard,
  Phone,
  ArrowRight,
  ShieldCheck,
  ShieldX
} from "lucide-react";

export const Recruiters: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const {
    recruiters,
    candidates,
    loading,
    fetchRecruiters,
    createRecruiter,
    updateRecruiter,
    deleteRecruiter,
    fetchCandidates,
    toggleCandidateAccess
  } = useRecruiterStore();

  const isAdmin = user?.role === "ADMIN";
  const hasAccess = user?.role === "ADMIN" || !!user?.can_view_recruiters;
  const canAddRecruiter = isAdmin || !!user?.can_add_recruiter;

  // Admin tab navigation: "directory" | "access"
  const [activeTab, setActiveTab] = useState<"directory" | "access">("directory");

  // Search queries
  const [recruiterSearch, setRecruiterSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");

  // CRUD Forms State
  const [showForm, setShowForm] = useState(false);
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null);
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formNumber, setFormNumber] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (hasAccess) {
      fetchRecruiters();
    }
    if (isAdmin) {
      fetchCandidates();
    }
  }, [hasAccess, isAdmin, fetchRecruiters, fetchCandidates]);

  // Handle Copy Number
  const handleCopyNumber = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    addToast("Phone number copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Open Form
  const openCreateForm = () => {
    setEditingRecruiter(null);
    setFormName("");
    setFormCompany("");
    setFormNumber("");
    setShowForm(true);
  };

  const openEditForm = (recruiter: Recruiter) => {
    setEditingRecruiter(recruiter);
    setFormName(recruiter.name);
    setFormCompany(recruiter.company);
    setFormNumber(recruiter.number);
    setShowForm(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCompany.trim() || !formNumber.trim()) {
      addToast("Please fill out all fields.", "warning");
      return;
    }

    try {
      if (editingRecruiter) {
        await updateRecruiter(editingRecruiter.id, {
          name: formName.trim(),
          company: formCompany.trim(),
          number: formNumber.trim(),
        });
        addToast("Recruiter details updated successfully!", "success");
      } else {
        await createRecruiter({
          name: formName.trim(),
          company: formCompany.trim(),
          number: formNumber.trim(),
        });
        addToast("Recruiter contact added successfully!", "success");
      }
      setShowForm(false);
      fetchRecruiters();
    } catch (err: any) {
      addToast(err.response?.data?.error || "An error occurred.", "error");
    }
  };

  // Handle Delete
  const handleDeleteRecruiter = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this recruiter contact permanently?")) {
      try {
        await deleteRecruiter(id);
        addToast("Recruiter contact deleted successfully.", "success");
        fetchRecruiters();
      } catch (err) {
        addToast("Failed to delete recruiter contact.", "error");
      }
    }
  };

  // Handle Toggle Candidate Permission
  const handleToggleAccess = async (id: string, currentAccess: boolean) => {
    try {
      await toggleCandidateAccess(id, !currentAccess);
      addToast("Candidate recruiter access updated successfully!", "success");
    } catch (err) {
      addToast("Failed to update candidate access.", "error");
    }
  };

  // Filter recruiters
  const filteredRecruiters = recruiters.filter(
    (r) =>
      r.name.toLowerCase().includes(recruiterSearch.toLowerCase()) ||
      r.company.toLowerCase().includes(recruiterSearch.toLowerCase())
  );

  // Filter candidates
  const filteredCandidates = candidates.filter(
    (c) =>
      c.name.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  // VIEW 1: Access Denied for Candidate
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Topbar />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl shadow-premium text-center flex flex-col items-center gap-5 animate-fade-in">
            <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shadow-inner">
              <LockKeyhole className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Access Locked</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                The recruiter directory portal is currently locked for your profile. Please contact your hiring manager or system administrator to request access approval.
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10"
            >
              Go Back
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />

      <main className="flex-grow mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              {isAdmin ? "Recruiter Contacts & Management" : "Recruiter Contact Directory"}
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {isAdmin
                ? "Manage recruiter details and configure candidate-specific directory access."
                : "Browse verified recruiter contacts and call lists."}
            </p>
          </div>

          {canAddRecruiter && !showForm && (
            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10 self-start md:self-auto"
            >
              <Plus className="w-4.5 h-4.5" />
              Add Recruiter
            </button>
          )}
        </div>

        {/* Admin Navigation Tabs */}
        {isAdmin && (
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => {
                setActiveTab("directory");
                setShowForm(false);
              }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all ${
                activeTab === "directory"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <PhoneCall className="w-4.5 h-4.5" />
              Recruiter Directory ({recruiters.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("access");
                setShowForm(false);
              }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-sm transition-all ${
                activeTab === "access"
                  ? "border-brand-600 text-brand-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              Candidate Access Control ({candidates.length})
            </button>
          </div>
        )}

        {/* Modal / Inline Add & Edit Form */}
        {(canAddRecruiter || (editingRecruiter && (isAdmin || editingRecruiter.created_by === user?.id))) && showForm && (
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-premium max-w-xl animate-fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-800 text-base">
                {editingRecruiter ? "Edit Recruiter Details" : "Add Recruiter Contact"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Recruiter Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Jane Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                    placeholder="Google Inc."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Contact Number
                </label>
                <input
                  type="text"
                  required
                  value={formNumber}
                  onChange={(e) => setFormNumber(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                  placeholder="+1 (555) 019-2834"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-md shadow-brand-500/10"
                >
                  {editingRecruiter ? "Save Changes" : "Create Listing"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab CONTENT: Recruiter Directory (Visible to Admin and Authorized Candidates) */}
        {(!isAdmin || activeTab === "directory") && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={recruiterSearch}
                onChange={(e) => setRecruiterSearch(e.target.value)}
                placeholder="Search recruiters by name or company..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white outline-none transition-all text-sm"
              />
              {recruiterSearch && (
                <button
                  onClick={() => setRecruiterSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Recruiter Contacts Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecruiters.map((recruiter) => (
                <div
                  key={recruiter.id}
                  className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-premium flex flex-col justify-between hover:border-brand-200 transition-all group hover:-translate-y-0.5"
                >
                  <div className="space-y-4">
                    {/* Header: Initial Symbol + Name */}
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold text-base shadow-sm">
                        {recruiter.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                          {recruiter.name}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5 font-medium">
                          <Building className="w-3.5 h-3.5" />
                          <span>{recruiter.company}</span>
                        </div>
                      </div>
                    </div>

                    {/* Contact details */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-700 font-semibold font-mono">
                        <Phone className="w-4 h-4 text-brand-600" />
                        <span>{recruiter.number}</span>
                      </div>
                      <button
                        onClick={() => handleCopyNumber(recruiter.id, recruiter.number)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100 shadow-sm"
                        title="Copy number"
                      >
                        {copiedId === recruiter.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Clipboard className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Actions (Admin Actions or Call action) */}
                  <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100/50">
                    <a
                      href={`tel:${recruiter.number}`}
                      className="flex-grow inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-xl transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call Recruiter
                    </a>

                    {(isAdmin || recruiter.created_by === user?.id) && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditForm(recruiter)}
                          className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit recruiter"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRecruiter(recruiter.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete recruiter"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredRecruiters.length === 0 && !loading && (
                <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-premium flex flex-col items-center justify-center gap-3">
                  <Phone className="w-10 h-10 text-slate-300" />
                  <p className="text-slate-400 text-sm font-semibold">
                    No recruiter contacts found matching the search criteria.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab CONTENT: Candidate Access Control (Admin Only) */}
        {isAdmin && activeTab === "access" && (
          <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                placeholder="Search candidates by name or email..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-white outline-none transition-all text-sm"
              />
              {candidateSearch && (
                <button
                  onClick={() => setCandidateSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Candidates Access Table */}
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-premium">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-6">Candidate Name</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6 text-center">Status</th>
                      <th className="py-3.5 px-6 text-center">Recruiter Page Authorization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            {candidate.profile_picture ? (
                              <img
                                src={candidate.profile_picture}
                                alt={candidate.name}
                                className="h-8 w-8 rounded-full object-cover shadow-sm border border-slate-100"
                              />
                            ) : (
                              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                                {candidate.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                            <span className="text-sm font-bold text-slate-800">{candidate.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-500 font-medium">{candidate.email}</td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500 uppercase">
                            Registered
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => handleToggleAccess(candidate.id, candidate.can_view_recruiters)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-1 focus:ring-brand-500 focus:ring-offset-2 ${
                                candidate.can_view_recruiters ? "bg-brand-600" : "bg-slate-200"
                              }`}
                              role="switch"
                              aria-checked={candidate.can_view_recruiters}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  candidate.can_view_recruiters ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                            <span className="ml-3 text-xs font-bold text-slate-600 w-16">
                              {candidate.can_view_recruiters ? (
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
                        </td>
                      </tr>
                    ))}

                    {filteredCandidates.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-12 text-center text-sm font-semibold text-slate-400">
                          No candidate listings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};
export default Recruiters;

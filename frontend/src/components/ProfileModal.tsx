import React, { useState, useEffect } from "react";
import { useUIStore } from "../stores/useUIStore";
import { useAuthStore } from "../stores/useAuthStore";
import {
  X,
  Mail,
  FileText,
  Edit2,
  Save,
  UploadCloud,
  Download,
  BookOpen,
  Key,
  Eye,
  EyeOff
} from "lucide-react";

export const ProfileModal: React.FC = () => {
  const { activeModal, closeModal, addToast } = useUIStore();
  const { user, updateProfile, loading } = useAuthStore();

  const isOpen = activeModal === "profile";

  const [isEditMode, setIsEditMode] = useState(false);
  const [bio, setBio] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Password change states
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // Sync state with user profile details when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setBio(user.bio || "");
      setFacebook(user.facebook_link || "");
      setLinkedin(user.linkedin_link || "");
      setGithub(user.github_link || "");
      setSelectedFile(null);
      setIsEditMode(false);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        addToast("Resume size must be under 5MB.", "error");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("bio", bio.trim());
    formData.append("facebook_link", facebook.trim());
    formData.append("linkedin_link", linkedin.trim());
    formData.append("github_link", github.trim());
    
    if (selectedFile) {
      formData.append("resume", selectedFile);
    }

    try {
      await updateProfile(formData);
      addToast("Profile updated successfully!", "success");
      setIsEditMode(false);
    } catch (err: any) {
      addToast("Failed to update profile.", "error");
    }
  };

  const handlePasswordSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      addToast("Please fill in all password fields.", "error");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      addToast("Passwords do not match.", "error");
      return;
    }
    if (newPassword.length < 6) {
      addToast("New password must be at least 6 characters long.", "error");
      return;
    }

    setPasswordChangeLoading(true);
    try {
      const { changePassword } = useAuthStore.getState();
      const msg = await changePassword(currentPassword, newPassword);
      addToast(msg, "success");
      
      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowPasswordChange(false);
    } catch (err: any) {
      addToast(err.response?.data?.error || err.response?.data?.detail || "Failed to change password.", "error");
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  // Helper to extract file name from full URL path
  const getResumeFileName = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1] || "Uploaded_Resume.pdf";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Candidate Profile</h2>
            <p className="text-slate-500 text-xs mt-0.5">Manage your biography, attachments, and coordinate links.</p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          
          {/* Avatar and Identity */}
          <div className="flex items-center gap-4 bg-slate-50/70 border border-slate-150/40 p-4 rounded-2xl">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-black text-xl shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </span>
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-slate-800 text-base">{user.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {user.email}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold text-brand-700 bg-brand-50 rounded-full uppercase tracking-wider mt-1.5 border border-brand-100">
                {user.role}
              </span>
            </div>
            
            {/* Edit/View toggle */}
            <button
              type="button"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`ml-auto flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm border ${
                isEditMode
                  ? "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                  : "bg-brand-600 text-white hover:bg-brand-700 border-transparent shadow-brand-500/10"
              }`}
            >
              {isEditMode ? (
                <>Cancel</>
              ) : (
                <>
                  <Edit2 className="w-3 h-3" />
                  Edit Profile
                </>
              )}
            </button>
          </div>

          {/* BIO Section */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-slate-400" />
              About Me / Bio
            </label>
            {isEditMode ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all resize-none font-semibold text-slate-700"
                placeholder="Write a brief description of your background and experience..."
              />
            ) : (
              <p className="text-sm font-semibold text-slate-600 leading-relaxed bg-slate-50/50 border border-slate-100 p-4 rounded-xl whitespace-pre-wrap min-h-[80px]">
                {user.bio || "No biography provided yet. Click 'Edit Profile' to add one!"}
              </p>
            )}
          </div>

          {/* Resume Upload / Download */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              Resume Attachment
            </label>
            
            {isEditMode ? (
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-400 transition-colors bg-slate-50/30 relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">
                  {selectedFile ? selectedFile.name : "Click or drag your PDF/DOC resume here"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Maximum file size: 5MB</p>
              </div>
            ) : user.resume ? (
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
                <div className="flex items-center gap-3">
                  <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[200px]">
                      {getResumeFileName(user.resume)}
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">PDF Resume Document</p>
                  </div>
                </div>
                <a
                  href={user.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-white text-slate-500 hover:text-brand-600 border border-slate-200 hover:border-brand-100 rounded-xl transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download
                </a>
              </div>
            ) : (
              <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl text-center text-xs font-semibold text-slate-400 italic">
                No resume uploaded yet. Edit your profile to attach your resume document.
              </div>
            )}
          </div>

          {/* Social Coordinates Links */}
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
              Professional Links
            </label>

            <div className="space-y-3">
              {/* LinkedIn */}
              <div className="flex items-center gap-3">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </span>
                {isEditMode ? (
                  <input
                    type="url"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-brand-500 outline-none transition-all font-semibold text-slate-700"
                    placeholder="https://linkedin.com/in/username"
                  />
                ) : user.linkedin_link ? (
                  <a
                    href={user.linkedin_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-indigo-600 hover:underline truncate"
                  >
                    {user.linkedin_link}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No LinkedIn profile linked</span>
                )}
              </div>

              {/* GitHub */}
              <div className="flex items-center gap-3">
                <span className="p-2 bg-slate-900 text-white rounded-xl flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </span>
                {isEditMode ? (
                  <input
                    type="url"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-brand-500 outline-none transition-all font-semibold text-slate-700"
                    placeholder="https://github.com/username"
                  />
                ) : user.github_link ? (
                  <a
                    href={user.github_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-slate-800 hover:underline truncate"
                  >
                    {user.github_link}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No GitHub profile linked</span>
                )}
              </div>

              {/* Facebook */}
              <div className="flex items-center gap-3">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </span>
                {isEditMode ? (
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-brand-500 outline-none transition-all font-semibold text-slate-700"
                    placeholder="https://facebook.com/username"
                  />
                ) : user.facebook_link ? (
                  <a
                    href={user.facebook_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline truncate"
                  >
                    {user.facebook_link}
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">No Facebook profile linked</span>
                )}
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors focus:outline-none"
            >
              <Key className="w-4 h-4" />
              {showPasswordChange ? "Hide Password Settings" : "Change Password"}
            </button>
            
            {showPasswordChange && (
              <div className="mt-4 p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 text-xs border border-slate-250 rounded-xl focus:border-brand-500 outline-none transition-all font-semibold text-slate-700 bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 text-xs border border-slate-250 rounded-xl focus:border-brand-500 outline-none transition-all font-semibold text-slate-700 bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full pl-3 pr-10 py-2 text-xs border border-slate-250 rounded-xl focus:border-brand-500 outline-none transition-all font-semibold text-slate-700 bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handlePasswordSubmit}
                  disabled={passwordChangeLoading}
                  className="w-full py-2 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  {passwordChangeLoading && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                  Update Password
                </button>
              </div>
            )}
          </div>

          {/* Action Row */}
          {isEditMode && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 bg-slate-50/20 -mx-6 -mb-6 p-6">
              <button
                type="button"
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center gap-1.5"
              >
                {loading && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          )}

        </form>
      </div>
    </div>
  );
};
export default ProfileModal;

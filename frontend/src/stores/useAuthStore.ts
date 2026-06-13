import { create } from "zustand";
import { api } from "../lib/axios";
import { connectWebSocket, disconnectWebSocket } from "../lib/socket";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CANDIDATE" | "VIEWER";
  bio?: string;
  facebook_link?: string;
  linkedin_link?: string;
  github_link?: string;
  resume?: string; // Serialized absolute download URL
  can_view_recruiters?: boolean;
  created_at: string;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  register: (data: { name: string; email: string; password?: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateProfile: (formData: FormData) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth/login/", credentials);
      // Hydrate profile after success login
      const profileResponse = await api.get<UserProfile>("/auth/me/");
      set({ user: profileResponse.data, isAuthenticated: true, loading: false });
      localStorage.setItem("interviewhub_user_authenticated", "true");
      connectWebSocket();
    } catch (err: any) {
      let errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        err.response?.data?.non_field_errors?.[0] ||
        "Invalid credentials. Please try again.";

      // Handle arrays or object shapes gracefully to avoid React rendering crashes
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      } else if (typeof errorMsg === "object" && errorMsg !== null) {
        errorMsg = errorMsg.detail || JSON.stringify(errorMsg);
        if (Array.isArray(errorMsg)) {
          errorMsg = errorMsg[0];
        }
      }

      set({ error: String(errorMsg), loading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/auth/register/", data);
      set({ loading: false });
    } catch (err: any) {
      let errorMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.email ||
        err.response?.data?.detail ||
        "Registration failed.";

      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg[0];
      } else if (typeof errorMsg === "object" && errorMsg !== null) {
        errorMsg = JSON.stringify(errorMsg);
      }

      set({ error: String(errorMsg), loading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post("/auth/logout/");
    } catch (err) {
      // Proceed with local logout even if request fails
      console.warn("Backend logout request failed:", err);
    } finally {
      set({ user: null, isAuthenticated: false, loading: false });
      localStorage.removeItem("interviewhub_user_authenticated");
      disconnectWebSocket();
    }
  },

  checkAuth: async () => {
    // If not flagged as authenticated locally, don't trigger server handshake
    if (!localStorage.getItem("interviewhub_user_authenticated")) {
      return;
    }
    
    set({ loading: true });
    try {
      const response = await api.get<UserProfile>("/auth/me/");
      set({ user: response.data, isAuthenticated: true, loading: false });
      connectWebSocket();
    } catch (err) {
      set({ user: null, isAuthenticated: false, loading: false });
      localStorage.removeItem("interviewhub_user_authenticated");
      disconnectWebSocket();
    }
  },

  updateProfile: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch<UserProfile>("/auth/me/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set({ user: response.data, loading: false });
    } catch (err: any) {
      set({ error: "Failed to update profile.", loading: false });
      throw err;
    }
  },

  verifyEmail: async (token) => {
    set({ loading: true, error: null });
    try {
      await api.get(`/auth/verify-email/?token=${token}`);
      set({ loading: false });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Email verification failed.";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  resendVerificationEmail: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/auth/resend-verification/", { email });
      set({ loading: false });
      return response.data.message || "Verification email resent successfully!";
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        "Failed to resend verification email.";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },
}));

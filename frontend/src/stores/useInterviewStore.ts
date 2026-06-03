import { create } from "zustand";
import { api } from "../lib/axios";

export interface CommentType {
  id: string;
  interview: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  text: string;
  created_at: string;
}

export interface HistoryLogType {
  id: string;
  message: string;
  actor_name: string;
  created_at: string;
}

export interface Interview {
  id: string;
  candidate: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  role: string;
  department: string;
  type: "TECHNICAL" | "HR" | "MANAGERIAL" | "CULTURE_FIT" | "FINAL_ROUND";
  mode: "ONLINE" | "IN_PERSON" | "PHONE";
  date: string;
  duration_min: number;
  interviewer: string;
  meeting_link: string;
  notes: string;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
  created_at: string;
  updated_at: string;
  comments: CommentType[];
  history: HistoryLogType[];
}

export interface DashboardStats {
  total: number;
  status_breakdown: Record<string, number>;
  type_breakdown: Record<string, number>;
}

interface InterviewState {
  interviews: Interview[];
  selectedInterview: Interview | null;
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchInterviews: (params?: Record<string, any>) => Promise<void>;
  fetchInterviewDetail: (id: string) => Promise<Interview>;
  createInterview: (data: any) => Promise<void>;
  updateInterview: (id: string, data: any) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  cancelInterview: (id: string) => Promise<void>;
  deleteInterview: (id: string) => Promise<void>;
  
  // WS sync actions
  addInterviewLocally: (interview: Interview) => void;
  updateStatusLocally: (id: string, newStatus: string) => void;
  removeInterviewLocally: (id: string) => void;
  fetchStats: () => Promise<void>;
}

export const useInterviewStore = create<InterviewState>((set, get) => ({
  interviews: [],
  selectedInterview: null,
  stats: null,
  loading: false,
  error: null,

  fetchInterviews: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<{ results: Interview[] }>("/interviews/", { params });
      // DRF might paginate with results array or return array directly if not paginated.
      // We'll support both safely:
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      set({ interviews: data, loading: false });
    } catch (err: any) {
      set({ error: "Failed to fetch interviews.", loading: false });
    }
  },

  fetchInterviewDetail: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<Interview>(`/interviews/${id}/`);
      set({ selectedInterview: response.data, loading: false });
      return response.data;
    } catch (err) {
      set({ error: "Failed to fetch interview details.", loading: false });
      throw err;
    }
  },

  createInterview: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/interviews/", data);
      set({ loading: false });
      get().fetchStats();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.errors?.[0]?.message || "Failed to schedule interview.";
      set({ error: errorMsg, loading: false });
      throw err;
    }
  },

  updateInterview: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch<Interview>(`/interviews/${id}/`, data);
      // In-place update for list
      const list = get().interviews.map((item) => (item.id === id ? response.data : item));
      set({
        interviews: list,
        selectedInterview: get().selectedInterview?.id === id ? response.data : get().selectedInterview,
        loading: false
      });
      get().fetchStats();
    } catch (err: any) {
      set({ error: "Failed to update interview details.", loading: false });
      throw err;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await api.patch<Interview>(`/interviews/${id}/status/`, { status });
      const list = get().interviews.map((item) => (item.id === id ? response.data : item));
      set({
        interviews: list,
        selectedInterview: get().selectedInterview?.id === id ? response.data : get().selectedInterview
      });
      get().fetchStats();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to update status.";
      throw new Error(errMsg);
    }
  },

  cancelInterview: async (id) => {
    try {
      const response = await api.patch<Interview>(`/interviews/${id}/cancel/`);
      const list = get().interviews.map((item) => (item.id === id ? response.data : item));
      set({
        interviews: list,
        selectedInterview: get().selectedInterview?.id === id ? response.data : get().selectedInterview
      });
      get().fetchStats();
    } catch (err: any) {
      const errMsg = err.response?.data?.error || "Failed to cancel interview.";
      throw new Error(errMsg);
    }
  },

  deleteInterview: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/interviews/${id}/`);
      const list = get().interviews.filter((item) => item.id !== id);
      set({
        interviews: list,
        selectedInterview: get().selectedInterview?.id === id ? null : get().selectedInterview,
        loading: false
      });
      get().fetchStats();
    } catch (err) {
      set({ error: "Failed to delete interview.", loading: false });
      throw err;
    }
  },

  fetchStats: async () => {
    try {
      const response = await api.get<DashboardStats>("/interviews/stats/");
      set({ stats: response.data });
    } catch (err) {
      console.warn("Failed to fetch dashboard metrics:", err);
    }
  },

  // WS Handlers
  addInterviewLocally: (interview) => {
    const exists = get().interviews.some((item) => item.id === interview.id);
    if (!exists) {
      set({ interviews: [interview, ...get().interviews] });
      // Proactively refresh dashboard stats
      get().fetchStats();
    }
  },

  updateStatusLocally: (id, newStatus) => {
    const list = get().interviews.map((item) => {
      if (item.id === id) {
        return { ...item, status: newStatus as any };
      }
      return item;
    });
    const selected = get().selectedInterview;
    set({
      interviews: list,
      selectedInterview: (selected && selected.id === id) ? { ...selected, status: newStatus as any } : selected
    });
    get().fetchStats();
  },

  removeInterviewLocally: (id) => {
    const list = get().interviews.filter((item) => item.id !== id);
    set({
      interviews: list,
      selectedInterview: get().selectedInterview?.id === id ? null : get().selectedInterview
    });
    get().fetchStats();
  },
}));

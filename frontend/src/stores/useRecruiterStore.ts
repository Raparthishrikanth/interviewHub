import { create } from "zustand";
import { api } from "../lib/axios";

export interface Recruiter {
  id: string;
  name: string;
  company: string;
  number: string;
  created_by?: string;
  created_at: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  can_view_recruiters: boolean;
  profile_picture?: string;
  created_at: string;
}

interface RecruiterState {
  recruiters: Recruiter[];
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  fetchRecruiters: () => Promise<void>;
  createRecruiter: (data: { name: string; company: string; number: string }) => Promise<void>;
  updateRecruiter: (id: string, data: { name: string; company: string; number: string }) => Promise<void>;
  deleteRecruiter: (id: string) => Promise<void>;
  fetchCandidates: () => Promise<void>;
  toggleCandidateAccess: (id: string, newAccess: boolean) => Promise<void>;
}

export const useRecruiterStore = create<RecruiterState>((set, get) => ({
  recruiters: [],
  candidates: [],
  loading: false,
  error: null,

  fetchRecruiters: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<any>("/recruiters/");
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      set({ recruiters: data, loading: false });
    } catch (err: any) {
      set({ error: "Failed to fetch recruiters list.", loading: false });
    }
  },

  createRecruiter: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/recruiters/", data);
      set({ 
        recruiters: [response.data, ...get().recruiters], 
        loading: false 
      });
    } catch (err: any) {
      set({ error: "Failed to create recruiter entry.", loading: false });
      throw err;
    }
  },

  updateRecruiter: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/recruiters/${id}/`, data);
      set({
        recruiters: get().recruiters.map((r) => (r.id === id ? response.data : r)),
        loading: false,
      });
    } catch (err: any) {
      set({ error: "Failed to update recruiter details.", loading: false });
      throw err;
    }
  },

  deleteRecruiter: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/recruiters/${id}/`);
      set({
        recruiters: get().recruiters.filter((r) => r.id !== id),
        loading: false,
      });
    } catch (err: any) {
      set({ error: "Failed to delete recruiter contact.", loading: false });
      throw err;
    }
  },

  fetchCandidates: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<any>("/candidates/");
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      set({ candidates: data, loading: false });
    } catch (err: any) {
      set({ error: "Failed to fetch candidates access list.", loading: false });
    }
  },

  toggleCandidateAccess: async (id, newAccess) => {
    set({ error: null });
    try {
      const response = await api.patch(`/candidates/${id}/`, {
        can_view_recruiters: newAccess,
      });
      set({
        candidates: get().candidates.map((c) => (c.id === id ? { ...c, can_view_recruiters: response.data.can_view_recruiters } : c)),
      });
    } catch (err: any) {
      set({ error: "Failed to modify candidate access privilege." });
      throw err;
    }
  },
}));

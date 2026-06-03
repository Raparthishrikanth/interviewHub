import { create } from "zustand";
import { api } from "../lib/axios";

export interface Notice {
  id: string;
  title: string;
  body: string;
  type: "GENERAL" | "REMINDER" | "UPDATE" | "IMPORTANT" | "HOLIDAY";
  priority: "LOW" | "MEDIUM" | "HIGH";
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  created_at: string;
  updated_at: string;
  comments?: any[];
}

interface NoticeState {
  notices: Notice[];
  loading: boolean;
  error: string | null;
  fetchNotices: () => Promise<void>;
  createNotice: (data: any) => Promise<void>;
  updateNotice: (id: string, data: any) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;
  
  // WS sync actions
  addNoticeLocally: (notice: Notice) => void;
  removeNoticeLocally: (id: string) => void;
}

export const useNoticeStore = create<NoticeState>((set, get) => ({
  notices: [],
  loading: false,
  error: null,

  fetchNotices: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<any>("/notices/");
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      set({ notices: data, loading: false });
    } catch (err) {
      set({ error: "Failed to fetch notices.", loading: false });
    }
  },

  createNotice: async (data) => {
    set({ loading: true, error: null });
    try {
      await api.post("/notices/", data);
      set({ loading: false });
    } catch (err: any) {
      set({ error: "Failed to create notice announcement.", loading: false });
      throw err;
    }
  },

  updateNotice: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await api.patch(`/notices/${id}/`, data);
      set({ loading: false });
    } catch (err) {
      set({ error: "Failed to update notice.", loading: false });
      throw err;
    }
  },

  deleteNotice: async (id) => {
    set({ loading: true });
    try {
      await api.delete(`/notices/${id}/`);
      set({ loading: false });
    } catch (err) {
      set({ error: "Failed to delete notice.", loading: false });
      throw err;
    }
  },

  // WS Handlers
  addNoticeLocally: (notice) => {
    const list = get().notices.filter((item) => item.id !== notice.id);
    set({ notices: [notice, ...list] });
  },

  removeNoticeLocally: (id) => {
    set({ notices: get().notices.filter((item) => item.id !== id) });
  },
}));

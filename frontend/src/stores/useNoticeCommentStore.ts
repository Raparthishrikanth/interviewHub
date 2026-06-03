import { create } from "zustand";
import { api } from "../lib/axios";
import { useNoticeStore } from "./useNoticeStore";

export interface NoticeCommentType {
  id: string;
  notice: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  text: string;
  created_at: string;
}

interface NoticeCommentState {
  commentsByNotice: Record<string, NoticeCommentType[]>;
  loading: boolean;
  error: string | null;
  fetchComments: (noticeId: string) => Promise<void>;
  addComment: (noticeId: string, text: string) => Promise<void>;
  deleteComment: (noticeId: string, commentId: string) => Promise<void>;
  
  // WS Handlers
  addCommentLocally: (noticeId: string, comment: NoticeCommentType) => void;
  removeCommentLocally: (noticeId: string, commentId: string) => void;
}

export const useNoticeCommentStore = create<NoticeCommentState>((set, get) => ({
  commentsByNotice: {},
  loading: false,
  error: null,

  fetchComments: async (noticeId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<NoticeCommentType[]>(`/notices/${noticeId}/comments/`);
      set((state) => ({
        commentsByNotice: {
          ...state.commentsByNotice,
          [noticeId]: response.data
        },
        loading: false
      }));
    } catch (err) {
      set({ error: "Failed to load announcement comments.", loading: false });
    }
  },

  addComment: async (noticeId, text) => {
    try {
      const response = await api.post<NoticeCommentType>(`/notices/${noticeId}/comments/`, { text });
      // In-place local update
      get().addCommentLocally(noticeId, response.data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to post comment.";
      throw new Error(errorMsg);
    }
  },

  deleteComment: async (noticeId, commentId) => {
    try {
      await api.delete(`/notices/${noticeId}/comments/${commentId}/`);
      get().removeCommentLocally(noticeId, commentId);
    } catch (err) {
      console.error("Failed to delete comment:", err);
      throw err;
    }
  },

  // WS Handlers
  addCommentLocally: (noticeId, comment) => {
    const noticeComments = get().commentsByNotice[noticeId] || [];
    const alreadyExists = noticeComments.some((c) => c.id === comment.id);
    if (!alreadyExists) {
      const updatedList = [...noticeComments, comment];
      set((state) => ({
        commentsByNotice: {
          ...state.commentsByNotice,
          [noticeId]: updatedList
        }
      }));

      // Also update the notice's comments array locally in the notice store
      const notices = useNoticeStore.getState().notices;
      const updatedNotices = notices.map((notice) => {
        if (notice.id === noticeId) {
          const currentComments = notice.comments || [];
          const hasComment = currentComments.some((c: any) => c.id === comment.id);
          if (!hasComment) {
            return {
              ...notice,
              comments: [...currentComments, comment]
            };
          }
        }
        return notice;
      });
      useNoticeStore.setState({ notices: updatedNotices });
    }
  },

  removeCommentLocally: (noticeId, commentId) => {
    const noticeComments = get().commentsByNotice[noticeId] || [];
    const updatedList = noticeComments.filter((c) => c.id !== commentId);
    set((state) => ({
      commentsByNotice: {
        ...state.commentsByNotice,
        [noticeId]: updatedList
      }
    }));

    // Also update the notice's comments array locally in the notice store
    const notices = useNoticeStore.getState().notices;
    const updatedNotices = notices.map((notice) => {
      if (notice.id === noticeId) {
        const currentComments = notice.comments || [];
        return {
          ...notice,
          comments: currentComments.filter((c: any) => c.id !== commentId)
        };
      }
      return notice;
    });
    useNoticeStore.setState({ notices: updatedNotices });
  }
}));

export default useNoticeCommentStore;

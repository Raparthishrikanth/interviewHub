import { create } from "zustand";
import { api } from "../lib/axios";
import { type CommentType, useInterviewStore } from "./useInterviewStore";

interface CommentState {
  comments: CommentType[];
  loading: boolean;
  error: string | null;
  fetchComments: (interviewId: string) => Promise<void>;
  addComment: (interviewId: string, text: string) => Promise<void>;
  deleteComment: (interviewId: string, commentId: string) => Promise<void>;
  
  // WS sync actions
  addCommentLocally: (interviewId: string, comment: CommentType) => void;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: [],
  loading: false,
  error: null,

  fetchComments: async (interviewId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<CommentType[]>(`/interviews/${interviewId}/comments/`);
      set({ comments: response.data, loading: false });
    } catch (err) {
      set({ error: "Failed to load comment thread.", loading: false });
    }
  },

  addComment: async (interviewId, text) => {
    try {
      await api.post(`/interviews/${interviewId}/comments/`, { text });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Failed to post comment.";
      throw new Error(errorMsg);
    }
  },

  deleteComment: async (interviewId, commentId) => {
    try {
      await api.delete(`/interviews/${interviewId}/comments/${commentId}/`);
      set({ comments: get().comments.filter((item) => item.id !== commentId) });
      
      // Also update parent interview state locally in-place
      const selected = useInterviewStore.getState().selectedInterview;
      if (selected && selected.id === interviewId) {
        useInterviewStore.setState({
          selectedInterview: {
            ...selected,
            comments: selected.comments.filter((item) => item.id !== commentId),
          },
        });
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      throw err;
    }
  },

  // WS Handlers
  addCommentLocally: (interviewId, comment) => {
    // 1. If currently viewing this interview's thread, append the comment
    const selected = useInterviewStore.getState().selectedInterview;
    if (selected && selected.id === interviewId) {
      const alreadyExists = selected.comments.some((c) => c.id === comment.id);
      if (!alreadyExists) {
        // Update selected interview's comments
        useInterviewStore.setState({
          selectedInterview: {
            ...selected,
            comments: [...selected.comments, comment],
          },
        });
        
        // Also update local comments list
        set({ comments: [...get().comments, comment] });
      }
    }
  },
}));

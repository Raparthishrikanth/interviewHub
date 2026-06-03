import { create } from "zustand";

export interface ToastMessage {
  message: string;
  type: "success" | "error" | "info" | "warning";
  id: number;
}

interface UIState {
  toasts: ToastMessage[];
  activeModal: string | null;
  modalData: any;
  calendarMonth: Date;
  addToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
  removeToast: (id: number) => void;
  openModal: (modalName: string, data?: any) => void;
  closeModal: () => void;
  setCalendarMonth: (date: Date) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  activeModal: null,
  modalData: null,
  calendarMonth: new Date(),

  addToast: (message, type = "success") => {
    const id = Date.now() + Math.random();
    const newToast = { message, type, id };
    
    set({ toasts: [...get().toasts, newToast] });
    
    // Auto-dismiss in 4 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  openModal: (modalName, data = null) => {
    set({ activeModal: modalName, modalData: data });
  },

  closeModal: () => {
    set({ activeModal: null, modalData: null });
  },

  setCalendarMonth: (date) => {
    set({ calendarMonth: date });
  },
}));

import { useInterviewStore } from "../stores/useInterviewStore";
import { useNoticeStore } from "../stores/useNoticeStore";
import { useCommentStore } from "../stores/useCommentStore";
import { useNoticeCommentStore } from "../stores/useNoticeCommentStore";

let socket: WebSocket | null = null;

export const connectWebSocket = () => {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8000";
  // The browser automatically passes the HTTP-only cookie during this handshake!
  socket = new WebSocket(`${wsUrl}/ws/interviewhub/`);

  socket.onopen = () => {
    console.log("WebSocket connection established with InterviewHub server.");
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      const { type, ...payload } = data;

      switch (type) {
        case "interview_created":
          if (payload.interview) {
            useInterviewStore.getState().addInterviewLocally(payload.interview);
          }
          break;
        case "interview_updated":
          if (payload.interview) {
            useInterviewStore.getState().updateInterviewLocally(payload.interview);
          }
          break;
        case "interview_status_changed":
          if (payload.interviewId && payload.newStatus) {
            useInterviewStore.getState().updateStatusLocally(payload.interviewId, payload.newStatus);
          }
          break;
        case "interview_deleted":
          if (payload.interviewId) {
            useInterviewStore.getState().removeInterviewLocally(payload.interviewId);
          }
          break;
        case "notice.new":
          if (payload.notice) {
            useNoticeStore.getState().addNoticeLocally(payload.notice);
          }
          break;
        case "notice.deleted":
          if (payload.noticeId) {
            useNoticeStore.getState().removeNoticeLocally(payload.noticeId);
          }
          break;
        case "comment.new":
          if (payload.interviewId && payload.comment) {
            useCommentStore.getState().addCommentLocally(payload.interviewId, payload.comment);
          }
          break;
        case "notice_comment_new":
          if (payload.noticeId && payload.comment) {
            useNoticeCommentStore.getState().addCommentLocally(payload.noticeId, payload.comment);
          }
          break;
        case "notice_comment_deleted":
          if (payload.noticeId && payload.commentId) {
            useNoticeCommentStore.getState().removeCommentLocally(payload.noticeId, payload.commentId);
          }
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Error processing WebSocket message payload:", err);
    }
  };

  socket.onclose = () => {
    console.warn("WebSocket connection terminated. Reconnecting in 5 seconds...");
    socket = null;
    setTimeout(connectWebSocket, 5000);
  };

  socket.onerror = (err) => {
    console.error("WebSocket transport error:", err);
  };
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
    console.log("WebSocket connection terminated manually.");
  }
};

import React from "react";

interface StatusBadgeProps {
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    PENDING: {
      bg: "bg-amber-50/70",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    CONFIRMED: {
      bg: "bg-indigo-50/70",
      text: "text-indigo-700",
      border: "border-indigo-200",
      dot: "bg-indigo-500",
    },
    COMPLETED: {
      bg: "bg-emerald-50/70",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    CANCELLED: {
      bg: "bg-rose-50/70",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
    },
    RESCHEDULED: {
      bg: "bg-purple-50/70",
      text: "text-purple-700",
      border: "border-purple-200",
      dot: "bg-purple-500",
    },
  };

  const style = styles[status] || styles.PENDING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {status}
    </span>
  );
};
export default StatusBadge;

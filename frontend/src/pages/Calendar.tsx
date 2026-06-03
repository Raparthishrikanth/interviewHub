import React, { useEffect, useState } from "react";
import { useInterviewStore } from "../stores/useInterviewStore";
import { useUIStore } from "../stores/useUIStore";
import { Topbar } from "../components/Topbar";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { ChevronLeft, ChevronRight, Video } from "lucide-react";

export const Calendar: React.FC = () => {
  const { interviews, fetchInterviews } = useInterviewStore();
  const { calendarMonth, setCalendarMonth } = useUIStore();
  const [hoveredInterviewId, setHoveredInterviewId] = useState<number | string | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  // Calendar generation helpers
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevDaysInMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(year, month + 1, 1));
  };

  // Helper arrays for calendar grid mapping
  const days = [];
  
  // 1. Previous month blank days padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    days.push({
      day: prevDaysInMonth - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevDaysInMonth - i)
    });
  }

  // 2. Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // 3. Next month blank days padding
  const totalCells = 42; // standard 6 rows grid
  const nextMonthPadding = totalCells - days.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  // Filter interviews falling on a specific day
  const getInterviewsForDate = (date: Date) => {
    return interviews.filter((interview) => {
      const interviewDate = new Date(interview.date);
      return (
        interviewDate.getDate() === date.getDate() &&
        interviewDate.getMonth() === date.getMonth() &&
        interviewDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dotColors = {
    PENDING: "bg-amber-500 hover:ring-amber-300",
    CONFIRMED: "bg-indigo-500 hover:ring-indigo-300",
    COMPLETED: "bg-emerald-500 hover:ring-emerald-300",
    CANCELLED: "bg-rose-500 hover:ring-rose-300",
    RESCHEDULED: "bg-purple-500 hover:ring-purple-300"
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Topbar />

      <main className="flex-grow mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 space-y-6">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Monthly Calendar</h1>
            <p className="text-slate-500 text-sm mt-0.5">Visualize your interview schedule mapped onto a monthly grid.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm self-start sm:self-auto">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-slate-800 min-w-[120px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Box */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-premium flex flex-col">
          
          {/* Days of Week header */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50 text-center py-3 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-t-3xl">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
            {days.map((cell, index) => {
              const dayInterviews = getInterviewsForDate(cell.date);
              const isToday =
                new Date().getDate() === cell.date.getDate() &&
                new Date().getMonth() === cell.date.getMonth() &&
                new Date().getFullYear() === cell.date.getFullYear();

              return (
                <div
                  key={index}
                  className={`min-h-[110px] p-2 flex flex-col justify-between hover:bg-slate-50/30 transition-colors relative group ${
                    cell.isCurrentMonth ? "bg-white" : "bg-slate-50/35 text-slate-400"
                  } ${
                    index === 35 ? "rounded-bl-3xl" : index === 41 ? "rounded-br-3xl" : ""
                  }`}
                >
                  {/* Day Number Row */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-brand-600 text-white shadow-sm"
                          : cell.isCurrentMonth
                          ? "text-slate-800"
                          : "text-slate-400"
                      }`}
                    >
                      {cell.day}
                    </span>
                    {dayInterviews.length > 0 && (
                      <span className="text-[9px] font-bold text-slate-400">
                        {dayInterviews.length} Round{dayInterviews.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Indicators / Dot list */}
                  <div className="flex flex-col gap-1 mt-2 flex-grow overflow-y-auto max-h-[70px] pr-0.5">
                    {dayInterviews.map((interview) => (
                      <Link
                        key={interview.id}
                        to={`/interviews/${interview.id}`}
                        onMouseEnter={() => setHoveredInterviewId(interview.id)}
                        onMouseLeave={() => setHoveredInterviewId(null)}
                        className="flex items-center gap-1.5 p-1 rounded hover:bg-slate-100/80 transition-colors group/dot w-full text-left"
                      >
                        {/* Dot indicator */}
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 transition-all hover:ring-2 ${
                            dotColors[interview.status] || "bg-amber-500"
                          }`}
                        ></span>
                        
                        {/* Summary text */}
                        <span className="text-[10px] font-bold truncate text-slate-700 leading-none max-w-[80px]">
                          {interview.candidate?.name.split(" ")[0]} ({interview.type.slice(0, 4)})
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Hover Popup Detail Panel (Escapes overflow container, positions smart left/right depending on column index) */}
                  {dayInterviews.map((interview) => {
                    if (interview.id !== hoveredInterviewId) return null;

                    const colIndex = index % 7;
                    let alignmentClass = "left-1/2 -translate-x-1/2";
                    if (colIndex === 0) {
                      alignmentClass = "left-2";
                    } else if (colIndex === 6) {
                      alignmentClass = "right-2";
                    }

                    return (
                      <div
                        key={`tooltip-${interview.id}`}
                        className={`absolute bottom-[105%] ${alignmentClass} flex flex-col gap-1 w-52 bg-slate-900 text-white text-xs p-3 rounded-xl shadow-2xl border border-slate-800 pointer-events-none z-50 animate-fade-in font-semibold`}
                      >
                        <p className="font-bold border-b border-slate-800 pb-1 text-[11px] uppercase tracking-wider text-brand-400">
                          {interview.type} Interview
                        </p>
                        <p className="text-[10px] text-slate-300 mt-1">
                          Candidate: <span className="text-white font-bold">{interview.candidate?.name}</span>
                        </p>
                        <p className="text-[10px] text-slate-300">
                          Role: <span className="text-white">{interview.role}</span>
                        </p>
                        <p className="text-[10px] text-slate-300">
                          Time:{" "}
                          <span className="text-white">
                            {new Date(interview.date).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </span>
                        </p>
                        {interview.meeting_link && (
                          <span className="text-[9px] text-brand-400 font-bold flex items-center gap-0.5 mt-1">
                            <Video className="w-3 h-3" />
                            Meeting Link Attached
                          </span>
                        )}
                      </div>
                    );
                  })}

                </div>
              );
            })}
          </div>

        </div>

      </main>
      <Footer />
    </div>
  );
};
export default Calendar;

"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Selection = {
  start: Date | null;
  end: Date | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onExportPdf: (start: Date | null, end: Date | null) => void;
  onExportErjuPdf: (start: Date | null, end: Date | null) => void;
};

// Helper functions to replace date-fns
const getMonthName = (date: Date) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[date.getMonth()];
};

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

const isAfter = (date1: Date, date2: Date) => {
  return date1.getTime() > date2.getTime();
};

const isWithinInterval = (date: Date, start: Date, end: Date) => {
  return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
};

const formatDate = (date: Date) => {
  return date.getDate().toString();
};

const RentCalendar: React.FC<Props> = ({ isOpen, onClose, onExportPdf, onExportErjuPdf }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selection, setSelection] = useState<Selection>({
    start: null,
    end: null,
  });

  if (!isOpen) return null;

  const nextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const prevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const handleClick = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Don't allow selection for dates after today
    if (day > today) {
      return;
    }
    
    if (!selection.start || (selection.start && selection.end)) {
      setSelection({ start: day, end: null });
    } else if (selection.start && isAfter(selection.start, day)) {
      setSelection({ start: day, end: null });
    } else {
      setSelection({ ...selection, end: day });
    }
  };

  const renderMonth = (monthDate: Date) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Adjust for Monday start (0 = Sunday, so Monday = 1)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return (
      <div className="flex-1 p-2 sm:p-3">
        <h3 className="text-center font-bold text-base sm:text-lg mb-3 text-black">
          {getMonthName(monthDate)} {year}
        </h3>

        <div className="grid grid-cols-7 gap-1 text-center">
          {["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"].map((d) => (
            <div key={d} className="font-bold text-gray-800 text-xs sm:text-sm">
              {d}
            </div>
          ))}

          {days.map((day, i) => {
            if (!day) {
              return <div key={i} className="h-8 w-8 sm:h-10 sm:w-10 mx-auto" />;
            }

            const selected =
              (selection.start && isSameDay(day, selection.start)) ||
              (selection.end && isSameDay(day, selection.end));

            const range =
              selection.start &&
              selection.end &&
              isWithinInterval(day, selection.start, selection.end);

            const today = isSameDay(day, new Date());
            const isFuture = day > new Date() && !today;

            return (
              <button
                key={i}
                onClick={() => handleClick(day)}
                disabled={isFuture}
                className={`
                  h-8 w-8 sm:h-10 sm:w-10 mx-auto flex items-center justify-center
                  rounded-full font-bold text-xs sm:text-sm
                  ${selected ? "bg-purple-600 text-white" : ""}
                  ${range ? "bg-purple-100" : ""}
                  ${today ? "border-2 border-red-500" : ""}
                  ${isFuture ? "text-gray-400 cursor-not-allowed" : "text-gray-900"}
                `}
              >
                {formatDate(day)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const reset = () => {
    setSelection({ start: null, end: null });
  };

  // Get next month
  const nextMonthDate = new Date(currentMonth);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-5xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={prevMonth}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            <ChevronLeft />
          </button>

          <h2 className="font-bold text-xl text-black">
            &nbsp;
          </h2>

          <button
            onClick={nextMonth}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
          >
            <ChevronRight />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {renderMonth(currentMonth)}
          <div className="hidden md:block w-px bg-slate-200 my-2" />
          {renderMonth(nextMonthDate)}
        </div>

        <div className="flex flex-wrap justify-between gap-3 mt-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-semibold"
            >
              Bekor qilish
            </button>

            <button
              onClick={reset}
              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition text-sm"
            >
              Reset
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                onExportPdf(selection.start, selection.end || selection.start);
                onClose();
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-semibold"
            >
              PDF
            </button>

            <button
              onClick={() => {
                onExportErjuPdf(selection.start, selection.end || selection.start);
                onClose();
              }}
              className="bg-fuchsia-600 text-white px-4 py-2 rounded-lg hover:bg-fuchsia-700 transition-all duration-200 shadow-sm hover:shadow-md text-sm font-semibold"
            >
              ERJU PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentCalendar;

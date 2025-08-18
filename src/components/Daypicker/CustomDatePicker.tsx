import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  format,
  parseISO,
  isWithinInterval,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/button";

export const CustomDatePicker = ({ selected, onSelect, footer }: any) => {
  const [currentMonth, setCurrentMonth] = useState(
    selected?.from || new Date()
  );

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (day: any) => {
    const { from, to } = selected || {};
    if (!from || isSameDay(day, from) || (to && isBefore(day, from))) {
      // Start a new selection or reset if clicking before current 'from'
      onSelect({ from: day, to: undefined });
    } else if (from && !to) {
      // Select 'to' date
      onSelect({ from, to: day });
    } else if (from && to && isAfter(day, to)) {
      // Extend the range
      onSelect({ from, to: day });
    } else {
      // If clicking inside an existing range, or if 'from' and 'to' are already set
      // and clicking before 'from' again, reset to new 'from'.
      onSelect({ from: day, to: undefined });
    }
  };

  const getDayClassName = (day: any) => {
    const classNames = [];
    if (selected?.from && selected?.to) {
      if (isSameDay(day, selected.from) || isSameDay(day, selected.to)) {
        classNames.push("bg-blue-600 text-white rounded-md");
      } else if (
        isWithinInterval(day, { start: selected.from, end: selected.to })
      ) {
        classNames.push("bg-blue-100 text-blue-800 rounded-none"); // Mid-range color
      }
    } else if (selected?.from && isSameDay(day, selected.from)) {
      classNames.push("bg-blue-600 text-white rounded-md");
    }

    // Add hover and other basic styles
    classNames.push(
      "w-10 h-10 flex items-center justify-center text-sm rounded-md hover:bg-gray-200"
    );

    return classNames.join(" ");
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rdp">
      {" "}
      {/* Using rdp class for DayPicker styles */}
      <div className="rdp-caption">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="rdp-nav_button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="rdp-caption_label font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="rdp-nav_button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-gray-600 font-medium text-xs uppercase my-2">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map(
          (_, i) => (
            <div key={`empty-${i}`} className="w-10 h-10"></div>
          )
        )}
        {daysInMonth.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => handleDayClick(day)}
            className={getDayClassName(day)}
          >
            {format(day, "d")}
          </button>
        ))}
      </div>
      {footer}
    </div>
  );
};

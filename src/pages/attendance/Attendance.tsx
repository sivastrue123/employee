// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import {
//   ColumnFiltersState,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getSortedRowModel,
//   SortingState,
//   useReactTable,
// } from "@tanstack/react-table";
import { ChevronDownIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

import { motion } from "framer-motion";
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  parseISO,
  set,
  startOfDay,
} from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { columns } from "./column.js";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button.js";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.js";
import { CustomDatePicker } from "@/components/Daypicker/CustomDatePicker.js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.js";
import { Badge } from "@/components/ui/badge.js";
import { attendanceData } from "../../../utils/attendanceData.js";
import { Input } from "@/components/ui/input.js";

function Attendance() {
  const [monthlyPresents, setMonthlyPresents] = useState(0);
  const [monthlyAbsents, setMonthlyAbsents] = useState(0);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean } | null>(
    null
  ); // Simplified sorting state
  const [dateRange, setDateRange] = useState<
    { from?: Date; to?: Date } | undefined
  >(undefined);

  const [open, setOpen] = React.useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  // Calculate monthly presents and absents for the current month

  useEffect(() => {
    const today = new Date();
    const currentMonthData = attendanceData.filter((item) => {
      const itemDate = parseISO(item.attendanceDate);
      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    });

    const presents = currentMonthData.filter(
      (item) => item.status === "Present"
    ).length;
    const absents = currentMonthData.filter(
      (item) => item.status === "Absent"
    ).length;

    setMonthlyPresents(presents);
    setMonthlyAbsents(absents);
  }, []);

  // Filter and sort data manually
  const filteredAndSortedData = useMemo(() => {
    let currentData = [...attendanceData];
    if (date) {
      if (dateRange && dateRange.from && dateRange.to) {
        setDateRange(undefined);
      }
      currentData = currentData.filter((item) => {
        const itemDate = parseISO(item.attendanceDate);
        return isSameDay(itemDate, date);
      });
    }
    // Apply date range filter
    if (dateRange && (dateRange.from || dateRange.to)) {
      if (date) {
        setDate(undefined); // Clear date selection if date range is applied
      }
      currentData = currentData.filter((item) => {
        const itemDate = parseISO(item.attendanceDate);
        const { from, to } = dateRange;

        // Ensure from and to are at the beginning/end of the day for accurate interval checking
        const startOfRange = from ? startOfDay(from) : null;
        const endOfRange = to ? endOfDay(to) : null;

        if (startOfRange && endOfRange) {
          return isWithinInterval(itemDate, {
            start: startOfRange,
            end: endOfRange,
          });
        }
        if (startOfRange) {
          return (
            isAfter(itemDate, startOfRange) || isSameDay(itemDate, startOfRange)
          );
        }
        if (endOfRange) {
          return (
            isBefore(itemDate, endOfRange) || isSameDay(itemDate, endOfRange)
          );
        }
        return true;
      });
    }

    // Apply sorting
    if (sorting) {
      currentData.sort((a, b) => {
        if (sorting.id === "attendanceDate") {
          const dateA = parseISO(a.attendanceDate);
          const dateB = parseISO(b.attendanceDate);
          return sorting.desc
            ? dateB.getTime() - dateA.getTime()
            : dateA.getTime() - dateB.getTime();
        }
        return 0;
      });
    }

    return currentData;
  }, [attendanceData, dateRange, sorting, date]);

  // Calculate presents/absents for displayed data (after filters)
  const filteredAttendanceSummary = useMemo(() => {
    const presents = filteredAndSortedData.filter(
      (item) => item.status === "Present"
    ).length;
    const absents = filteredAndSortedData.filter(
      (item) => item.status === "Absent"
    ).length;
    return { presents, absents };
  }, [filteredAndSortedData]);

  // Function to handle sorting click
  const handleSort = (columnId: string) => {
    setSorting((prev) => {
      if (prev && prev.id === columnId) {
        return { id: columnId, desc: !prev.desc };
      }
      return { id: columnId, desc: false }; // Default to asc
    });
  };

  return (
    <div className="lg:w-full mx-40 ">
      <div>
        <p className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
          Attendace
        </p>
        <p className="text-lg text-slate-600">Manage your time efficiently</p>
      </div>
      <div className="w-[80%] bg-white p-6 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-700">
            Detailed Attendance
          </h2>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-48 justify-between font-normal"
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger className="!border-none !bg-transparent  ">
              <Button
                // variant={"default"}
                className={`w-full !border-none text-black sm:w-[300px] justify-start text-left font-normal ${
                  !dateRange?.from ? "text-gray-500" : ""
                }`}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CustomDatePicker
                selected={dateRange}
                onSelect={setDateRange}
                footer={
                  <div className="flex justify-end p-2">
                    <Button
                      variant="ghost"
                      onClick={() => setDateRange(undefined)}
                      className="text-sm"
                    >
                      Clear
                    </Button>
                  </div>
                }
              />
            </PopoverContent>
          </Popover>
        </div>

        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("attendanceDate")}
                >
                  Date{" "}
                  {sorting?.id === "attendanceDate"
                    ? sorting.desc
                      ? " 🔽"
                      : " 🔼"
                    : ""}
                </Button>
              </TableHead>
              <TableHead>Clock In</TableHead>
              <TableHead>Clock Out</TableHead>
              <TableHead>OT</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length > 0 ? (
              filteredAndSortedData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {format(parseISO(row.attendanceDate), "PPP")}
                  </TableCell>
                  <TableCell>{row.clockIn}</TableCell>
                  <TableCell>{row.clockOut}</TableCell>
                  <TableCell>{row.ot}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.status === "Present" ? "default" : "destructive"
                      }
                    >
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results found for the selected date range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default Attendance;

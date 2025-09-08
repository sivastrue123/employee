import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDownIcon, Search } from "lucide-react";
import React from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { CustomDatePicker } from "@/components/Daypicker/CustomDatePicker";
import { DateRange, Preset } from "@/types/attendanceTypes";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState, useRef } from "react";

import {
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";

import { useDebouncedCallback } from "use-debounce";

import axios from "axios";

import {
  parseTimeToMinutes,
  squash,
  toLowerSafe,
} from "@/helpers/attendanceDateHelper";
import { SortState, AttendanceRecord } from "@/types/attendanceTypes";
import { useToast } from "@/toast/ToastProvider"; // ✅ bring in your custom toast
import { api } from "@/lib/axios";

const UserTable: React.FC<any> = ({
  pageSize,
  user,
  attendanceRefresh,
  setMonthlyPresents,
  setMonthlyAbsents,
  setCurrentViewAbsent,
  setcurrentViewPresent,
}) => {
  const [sorting, setSorting] = useState<SortState>(null);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(undefined);
  const [openSingle, setOpenSingle] = useState<boolean>(false);
  const [openRange, setOpenRange] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const toast = useToast(); // ✅ instantiate toast

  const debouncedSearch = useDebouncedCallback((query) => {
    setQuery(query);
  }, 500);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleGetAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await api.get(
        `/api/attendance/getAttendanceByEmployee/employee/${user?.employee_id}`
      );
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);

      toast.error(
        "We couldn’t fetch your attendance records at this moment. Please try again shortly.",
        {
          title: "Attendance fetch failed",
          durationMs: 5000,
          position: "bottom-center",
        }
      );

      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleGetAttendanceData();
  }, [user?.employee_id, attendanceRefresh]);

  const filteredAndSortedData = useMemo(() => {
    let currentData = [...attendanceData];

    // single-date filter
    if (date) {
      currentData = currentData.filter((item) =>
        isSameDay(parseISO(item.attendanceDate), date)
      );
    }

    // range filter
    if (dateRange && (dateRange.from || dateRange.to)) {
      const start = dateRange.from ? startOfDay(dateRange.from) : undefined;
      const end = dateRange.to ? endOfDay(dateRange.to) : undefined;

      currentData = currentData.filter((item) => {
        const d = parseISO(item.attendanceDate);
        if (start && end) return isWithinInterval(d, { start, end });
        if (start) return isAfter(d, start) || isSameDay(d, start);
        if (end) return isBefore(d, end) || isSameDay(d, end);
        return true;
      });
    }

    // query filter
    if (query.trim()) {
      const q = toLowerSafe(query);
      const qSquash = squash(query);
      const qMins = parseTimeToMinutes(query);

      currentData = currentData.filter((item) => {
        const dateStr = format(
          parseISO(item.attendanceDate),
          "PPPP"
        ).toLowerCase();
        const cin = toLowerSafe(item.clockIn);
        const cout = toLowerSafe(item.clockOut);

        const cinSquash = squash(item.clockIn);
        const coutSquash = squash(item.clockOut);

        const cinMins = parseTimeToMinutes(item.clockIn);
        const coutMins = parseTimeToMinutes(item.clockOut);

        const status = toLowerSafe(item.status);

        const textHit =
          dateStr.includes(q) ||
          status.includes(q) ||
          cin.includes(q) ||
          cout.includes(q) ||
          cinSquash.includes(qSquash) ||
          coutSquash.includes(qSquash);

        const timeHit =
          qMins !== null && (cinMins === qMins || coutMins === qMins);

        return textHit || timeHit;
      });
    }

    // sorting
    if (sorting?.id === "attendanceDate") {
      currentData.sort((a, b) => {
        const A = parseISO(a.attendanceDate).getTime();
        const B = parseISO(b.attendanceDate).getTime();
        return sorting.desc ? B - A : A - B;
      });
    }

    return currentData;
  }, [date, dateRange, query, sorting, attendanceData, attendanceRefresh]);

  // Monthly aggregates
  useEffect(() => {
    const today = new Date();
    const currentMonthData = attendanceData.filter((item) => {
      const itemDate = parseISO(item.attendanceDate);
      return (
        itemDate.getMonth() === today.getMonth() &&
        itemDate.getFullYear() === today.getFullYear()
      );
    });

    setMonthlyPresents(
      currentMonthData.filter((i) => i.status === "Present").length
    );
    setMonthlyAbsents(
      currentMonthData.filter((i) => i.status === "Absent").length
    );
  }, [attendanceData, attendanceRefresh]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [date, dateRange, query, sorting]);

  const filteredAttendanceSummary = useMemo(() => {
    const presents = filteredAndSortedData.filter(
      (i) => i.status === "Present"
    ).length;
    const absents = filteredAndSortedData.filter(
      (i) => i.status === "Absent"
    ).length;
    setCurrentViewAbsent(absents);
    setcurrentViewPresent(presents);
    return { presents, absents };
  }, [filteredAndSortedData]);

  const total = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = filteredAndSortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (columnId: "attendanceDate") => {
    setSorting((prev) => {
      if (prev && prev.id === columnId)
        return { id: columnId, desc: !prev.desc };
      return { id: columnId, desc: true };
    });
  };

  const applyPreset = (preset: Preset) => {
    const now = new Date();
    setActivePreset(preset === "clear" ? null : preset);

    if (preset === "today") {
      setDate(now);
      setDateRange(undefined);
    } else if (preset === "week") {
      setDate(undefined);
      setDateRange({
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      });
    } else if (preset === "month") {
      setDate(undefined);
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
    } else {
      setDate(undefined);
      setDateRange(undefined);
    }
  };
  return (
    <>
      {" "}
      <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Search */}

            <div className="relative">
              <Input
                aria-label="Search attendance"
                placeholder="Search date, status, or time…"
                className="w-[260px] pr-10"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                <Search className=" w-4 h-4" />
              </span>
            </div>

            {/* Single date */}
            <Popover open={openSingle} onOpenChange={setOpenSingle}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-44 justify-between"
                  aria-label="Pick a date"
                >
                  <span className="truncate">
                    {date ? format(date, "PP") : "Select date"}
                  </span>
                  <ChevronDownIcon className="h-4 w-4 opacity-70" />
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
                  onSelect={(d?: Date) => {
                    setDate(d);
                    if (d) setDateRange && setDateRange(undefined);
                    setOpenSingle(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Range date */}
            <Popover open={openRange} onOpenChange={setOpenRange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left"
                  aria-label="Pick a date range"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} –{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span className="text-slate-500">Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CustomDatePicker
                  selected={dateRange}
                  onSelect={(r: DateRange) => {
                    setDateRange && setDateRange(r);
                    if (r?.from || r?.to) setDate(undefined);
                  }}
                  footer={
                    <div className="flex w-full items-center justify-between p-2">
                      <div className="text-xs text-slate-500">
                        Tip: drag to select a range
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setDateRange && setDateRange(undefined)}
                        className="text-sm"
                      >
                        Clear
                      </Button>
                    </div>
                  }
                />
              </PopoverContent>
            </Popover>

            {/* Presets */}
            <div className="flex items-center gap-1">
              <Button
                variant={activePreset === "today" ? "outline" : "ghost"}
                size="sm"
                onClick={() => applyPreset("today")}
                className={
                  activePreset === "today" ? "!hidden sm:inline-flex" : ""
                }
              >
                Today
              </Button>
              <Button
                variant={activePreset === "week" ? "outline" : "ghost"}
                size="sm"
                onClick={() => applyPreset("week")}
                className={
                  activePreset === "week" ? "!hidden sm:inline-flex" : ""
                }
              >
                This week
              </Button>
              <Button
                variant={activePreset === "month" ? "outline" : "ghost"}
                size="sm"
                onClick={() => applyPreset("month")}
                className={
                  activePreset === "month" ? "!hidden sm:inline-flex" : ""
                }
              >
                This month
              </Button>
              <Button
                variant={activePreset === null ? "outline" : "ghost"}
                size="sm"
                onClick={() => applyPreset("clear")}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="rounded-xl border bg-white shadow-sm"
      >
        <div className="overflow-auto">
          <Table className="min-w-full text-sm">
            <TableHeader className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("attendanceDate")}
                  >
                    Date{" "}
                    {sorting?.id === "attendanceDate"
                      ? sorting.desc
                        ? "🔽"
                        : "🔼"
                      : ""}
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">Clock In</TableHead>
                <TableHead className="whitespace-nowrap">Clock Out</TableHead>
                <TableHead className="whitespace-nowrap">
                  Total Hours Worked
                </TableHead>
                <TableHead className="whitespace-nowrap">OT</TableHead>
                <TableHead className="whitespace-nowrap">Late</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paged.length > 0 ? (
                paged.map((row: any) => (
                  <TableRow
                    key={row.id}
                    className="even:bg-slate-50/40 hover:bg-amber-50/60 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {format(parseISO(row.attendanceDate), "PPP")}
                    </TableCell>
                    <TableCell>
                      {row.clockIn == "" ? "—" : row.clockIn}
                    </TableCell>
                    <TableCell className="">
                      {row.clockOut === "" ? "—" : row.clockOut}
                    </TableCell>
                    <TableCell className="">
                      {row.worked === "" ? "—" : row.worked}
                    </TableCell>
                    <TableCell>{row.ot ?? "—"}</TableCell>
                    <TableCell>{row.late ?? "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          row.status === "Present" ? "default" : "destructive"
                        }
                        className="uppercase tracking-wide"
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="w-full">
                  {loading ? (
                    <TableCell colSpan={13} className="h-40 text-center">
                      Loading…
                    </TableCell>
                  ) : (
                    <TableCell
                      colSpan={5}
                      className="h-56 text-center align-middle"
                    >
                      <div className="mx-auto max-w-sm">
                        <div className="mb-2 text-5xl">🗓️</div>
                        <div className="text-lg font-semibold text-slate-900">
                          No results in this view
                        </div>
                        <div className="mt-1 text-sm text-slate-600">
                          Try widening your date range or clearing filters.
                        </div>
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            onClick={() => applyPreset("clear")}
                          >
                            Reset filters
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer / pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t p-3 sm:flex-row">
          <div className="text-xs text-slate-600">
            Showing{" "}
            <span className="font-medium">
              {total === 0 ? 0 : (page - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, total)}
            </span>{" "}
            of <span className="font-medium">{total}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p: number) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="text-xs text-slate-600">
              Page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p: number) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UserTable;

import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
  parseISO,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  parse,
} from "date-fns";
import { ChevronDownIcon, CalendarIcon, Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomDatePicker } from "@/components/Daypicker/CustomDatePicker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { attendanceData as rawAttendanceData } from "../../../utils/attendanceData";
import {
  parseTimeToMinutes,
  squash,
  toLowerSafe,
} from "@/helpers/attendanceDateHelper";
import {
  SortState,
  Preset,
  AttendanceRecord,
  DateRange,
} from "@/types/attendanceTypes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTable from "./UserTable";
import EmployeeTable from "./EmployeeTable";

// -------- Types --------

const kpiCard = {
  base: "rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow p-4",
  title: "text-sm font-medium text-slate-500",
  value: "text-2xl font-semibold text-slate-900",
  sub: "text-xs text-slate-500",
} as const;

const pageSize = 10;

const Attendance: React.FC = () => {
  const { user, attendanceRefresh } = useAuth();
  const [monthlyPresents, setMonthlyPresents] = useState<number>(0);
  const [monthlyAbsents, setMonthlyAbsents] = useState<number>(0);
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

  const debouncedSearch = useDebouncedCallback((query) => {
    setQuery(query);
  }, 500); // 500ms debounce delay

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleGetAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/api/attendance/getAttendanceByEmployee/employee/${user?.employee_id}`
      );
      setAttendanceData(response.data.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
      alert(
        "Something went wrong while fetching attendance data. Please try again."
      );
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
    <div className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="mb-6">
        <p className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
          Attendance
        </p>
        <p className="mt-1 text-slate-600">
          Keep a clean view of time and presence—filter, sort, and review at a
          glance.
        </p>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={kpiCard.base} aria-live="polite">
          <div className={kpiCard.title}>This Month • Present</div>
          <div className={kpiCard.value}>{monthlyPresents}</div>
          <div className={kpiCard.sub}>
            Auto-calculated for the current month
          </div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>This Month • Absent</div>
          <div className={kpiCard.value}>{monthlyAbsents}</div>
          <div className={kpiCard.sub}>
            Auto-calculated for the current month
          </div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Current View • Present</div>
          <div className={kpiCard.value}>
            {filteredAttendanceSummary.presents}
          </div>
          <div className={kpiCard.sub}>Based on filters below</div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Current View • Absent</div>
          <div className={kpiCard.value}>
            {filteredAttendanceSummary.absents}
          </div>
          <div className={kpiCard.sub}>Based on filters below</div>
        </div>
      </div>

      {user?.role === "admin" ? (
        <>
          <Tabs defaultValue="user" className="">
            <TabsList className="!border-none w-full ">
              <TabsTrigger value="user" className="tab-trigger">
                User
              </TabsTrigger>
              <TabsTrigger value="employees" className="tab-trigger">
                Employees
              </TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              <>
                <UserTable
                  query={query}
                  activePreset={activePreset}
                  applyPreset={applyPreset}
                  date={date}
                  dateRange={dateRange}
                  handleSort={handleSort}
                  openRange={openRange}
                  openSingle={openSingle}
                  page={page}
                  pageSize={pageSize}
                  paged={paged}
                  setDate={setDate}
                  setDateRange={setDateRange}
                  setOpenRange={setOpenRange}
                  setOpenSingle={setOpenSingle}
                  setPage={setPage}
                  setQuery={setQuery}
                  sorting={sorting}
                  total={total}
                  totalPages={totalPages}
                />
              </>
            </TabsContent>
            <TabsContent value="employees">
             <EmployeeTable/>
            </TabsContent>
            <style>{`
              .tab-trigger {
                transition: background-color 0.3s ease, color 0.3s ease;
              }

              .tab-trigger[data-state="active"] {
                background-color: #33cdf3ff; /* Active tab background color */
                color: white; /* Active tab text color */
              }
            `}</style>
          </Tabs>
        </>
      ) : (
        <>
          <UserTable
            query={query}
            activePreset={activePreset}
            applyPreset={applyPreset}
            date={date}
            dateRange={dateRange}
            handleSort={handleSort}
            openRange={openRange}
            openSingle={openSingle}
            page={page}
            pageSize={pageSize}
            paged={paged}
            setDate={setDate}
            setDateRange={setDateRange}
            setOpenRange={setOpenRange}
            setOpenSingle={setOpenSingle}
            setPage={setPage}
            setQuery={setQuery}
            sorting={sorting}
            total={total}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
};

export default Attendance;

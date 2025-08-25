import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDownIcon, Search } from "lucide-react";
import { motion } from "framer-motion";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import { useDebouncedCallback } from "use-debounce";
import { useAuth } from "@/context/AuthContext";
import {
  DateRange as RDateRange,
  Preset,
  SortState,
} from "@/types/attendanceTypes";
import {
  parseTimeToMinutes,
  squash,
  toLowerSafe,
} from "@/helpers/attendanceDateHelper";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import makeAnimated from "react-select/animated";
import Select from "react-select";

type Checked = DropdownMenuCheckboxItemProps["checked"];
const PAGE_SIZE = 10;
type Option = { value: string; label: string };
type Employee = {
  employee_id: string;
  first_name: string;
  last_name: string;
  department?: string | null;
};

type AttendanceRow = {
  id: string;
  attendanceDate: string; // ISO date
  employeeId?: string;
  employeeName?: string | null;
  employeeDepartment?: string | null;
  clockIn?: string | null;
  clockOut?: string | null;
  worked?: string | null;
  ot?: string | null;
  late?: string | null;
  status: "Present" | "Absent" | string;
  createdBy?: { name?: string | null } | null;
  createdAt?: string | null; // ISO
  editedBy?: { name?: string | null } | null;
  editedAt?: string | null; // ISO
};

type DateRange = RDateRange | undefined;

type Filters = {
  selectedEmployeeIds: string[]; // canonical set
  singleDate?: Date; // mutually exclusive with range
  range?: { from?: Date; to?: Date };
  search: string;
  preset: Preset | null;
  sort: SortState; // { id: 'attendanceDate', desc: boolean } | null
  page: number;
};

const iso = (d?: Date) => (d ? d.toISOString() : undefined);
const asDateOrNull = (val?: unknown): Date | null => {
  if (val == null) return null;

  // number-like (epoch millis or seconds)
  if (typeof val === "number") {
    const d = new Date(val > 1e12 ? val : val * 1000);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof val === "string") {
    // try ISO first
    let d = parseISO(val);
    if (!isNaN(d.getTime())) return d;

    // fallback: native Date parsing (handles '2025-08-25 12:00:00' in many envs)
    d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  return null;
};

const fmtDay = (input?: unknown) => {
  const d = asDateOrNull(input);
  return d ? format(d, "PPP") : "—";
};

const fmtDateTime = (input?: unknown) => {
  const d = asDateOrNull(input);
  return d ? format(d, "PP p") : "—";
};
const pad = (n: number, w = 2) => String(Math.abs(n)).padStart(w, "0");

const toOffsetISOString = (d: Date) => {
  const tz = -d.getTimezoneOffset(); // minutes east of UTC
  const sign = tz >= 0 ? "+" : "-";
  const hhOff = pad(Math.trunc(Math.abs(tz) / 60));
  const mmOff = pad(Math.abs(tz) % 60);

  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  const ms = pad(d.getMilliseconds(), 3);

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}.${ms}${sign}${hhOff}:${mmOff}`;
};

const serializeParams = (opts: {
  employeeIds?: string[];
  today?: Date;
  from?: Date;
  to?: Date;
}) => {
  const params = new URLSearchParams();

  if (opts.employeeIds?.length)
    params.set("employeeIds", opts.employeeIds.join(","));

  if (opts.today) params.set("today", toOffsetISOString(opts.today));

  if (opts.from) params.set("from", toOffsetISOString(opts.from));
  if (opts.to) params.set("to", toOffsetISOString(opts.to));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

const EmployeeTable: React.FC<{
  setMonthlyAbsents: (n: number) => void;
  setMonthlyPresents: (n: number) => void;
  setCurrentViewAbsent: (n: number) => void;
  setcurrentViewPresent: (n: number) => void;
}> = ({
  setMonthlyAbsents,
  setMonthlyPresents,
  setCurrentViewAbsent,
  setcurrentViewPresent,
}) => {
  const { attendanceRefresh, user } = useAuth();

  const animatedComponents = makeAnimated();
  // --- Local state
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>([]);
  const [filters, setFilters] = useState<Filters>({
    selectedEmployeeIds: [],
    singleDate: undefined,
    range: undefined,
    search: "",
    preset: null,
    sort: null,
    page: 1,
  });
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openSingle, setOpenSingle] = useState(false);
  const [openRange, setOpenRange] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<Option[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<Option | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const employeeSelectOptions: Option[] = useMemo(
    () =>
      employeeOptions.map((emp) => ({
        value: emp.employee_id,
        label: `${emp.first_name} ${emp.last_name}`,
      })),
    [employeeOptions]
  );

  const attendanceStatus = [
    {
      value: "Present",
      label: "Present",
    },
    { value: "Absent", label: "Absent" },
    { value: "On Leave", label: "OnLeave" },
    { value: "Permission", label: "Permission" },
  ];

  // --- Debounced search (table-wide search)
  const setSearchDebounced = useDebouncedCallback((q: string) => {
    setFilters((f) => ({ ...f, search: q, page: 1 }));
  }, 400);
  const addAttendance = async (payload: {
    employeeIds: string[];
    status: string | null;
    reason: string | null;
    date: Date | string | null;
  }) => {
    // Example fetch pattern; replace URL and shape as needed.
    const res = await axios.post(
      `/api/attendance/MoreActions/${user?.userId}`,
      { payload }
    );

    console.log(res);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      employeeIds: selectedEmployees.map((o) => o.value),
      status: selectedStatus?.value ?? null,
      reason: reason.trim() || null,
      date: new Date().toISOString().split("T")[0],
    };
    console.log("Submitting attendance payload:", payload);

    try {
      const result = await addAttendance(payload);
      console.log("API success:", result);
      // Only close the Sheet on successful API resolution
      setOpen(false);
      // Optional: clear form after success
      setSelectedEmployees([]);
      setSelectedStatus(null);
      setReason("");
    } catch (err) {
      console.error("API error:", err);
      // Keep the Sheet open for remediation
      // Optionally surface a toast/error UI here
    } finally {
      setSubmitting(false);
    }
  };

  // --- Render
  // --- Bootstrap employees
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get<Employee[]>("/api/employee/getAllEmployee");
        if (!active) return;
        setEmployeeOptions(res.data ?? []);
      } catch {
        // soft-fail; UI still usable
        setEmployeeOptions([]);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // --- Data fetch with race cancellation
  const lastAbortRef = useRef<AbortController | null>(null);

  const fetchAttendance = useCallback(
    async (opts: {
      employeeIds?: string[];
      singleDate?: Date;
      range?: { from?: Date; to?: Date };
    }) => {
      const { employeeIds, singleDate, range } = opts;
      console.log(range, "From before the api call");
      // build query
      const qs = serializeParams({
        employeeIds,
        today: singleDate,
        from: range?.from,
        to: range?.to,
      });
      console.log(qs, "after the query is selected ");

      // cancel previous in-flight
      lastAbortRef.current?.abort();
      const controller = new AbortController();
      lastAbortRef.current = controller;

      setLoading(true);
      try {
        const res = await axios.get<{ data: AttendanceRow[] }>(
          `/api/attendance/getAllAttendance${qs}`,
          { signal: controller.signal }
        );
        setRows(res.data?.data ?? []);
      } catch (e: any) {
        if (axios.isCancel(e)) return; // cancelled—no UX noise
        // Targeted messaging
        const status = e?.response?.status;
        if (status === 404) {
          setRows([]);
        } else {
          // Keep calm and proceed—avoid blocking UX
          setRows([]);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // --- Fetch on filter changes (single source of truth)
  useEffect(() => {
    const { selectedEmployeeIds, singleDate, range } = filters;
    // Coerce empty range to undefined
    const cleanRange =
      range?.from || range?.to ? { from: range.from, to: range.to } : undefined;

    fetchAttendance({
      employeeIds: selectedEmployeeIds,
      singleDate,
      range: cleanRange,
    });
  }, [
    filters.selectedEmployeeIds,
    filters.singleDate,
    filters.range,
    attendanceRefresh,
    fetchAttendance,
  ]);

  // --- Derived datasets
  const filteredAndSorted = useMemo(() => {
    const q = filters.search.trim();
    const qLower = toLowerSafe(q);
    const qSquash = squash(q);
    const qMins = parseTimeToMinutes(q);

    let data = rows;

    if (q) {
      data = data.filter((item) => {
        const dateStr = format(
          parseISO(item.attendanceDate),
          "PPPP"
        ).toLowerCase();
        const cin = toLowerSafe(item.clockIn ?? "");
        const cout = toLowerSafe(item.clockOut ?? "");
        const cinSquash = squash(item.clockIn ?? "");
        const coutSquash = squash(item.clockOut ?? "");
        const cinMins = parseTimeToMinutes(item.clockIn ?? "");
        const coutMins = parseTimeToMinutes(item.clockOut ?? "");
        const status = toLowerSafe(item.status);

        const textHit =
          dateStr.includes(qLower) ||
          status.includes(qLower) ||
          cin.includes(qLower) ||
          cout.includes(qLower) ||
          cinSquash.includes(qSquash) ||
          coutSquash.includes(qSquash);

        const timeHit =
          qMins !== null && (cinMins === qMins || coutMins === qMins);
        return textHit || timeHit;
      });
    }

    if (filters.sort?.id === "attendanceDate") {
      const desc = !!filters.sort.desc;
      data = [...data].sort((a, b) => {
        const A = parseISO(a.attendanceDate).getTime();
        const B = parseISO(b.attendanceDate).getTime();
        return desc ? B - A : A - B;
      });
    }

    return data;
  }, [rows, filters.search, filters.sort]);

  // --- KPIs for the dashboard
  useEffect(() => {
    // Month rollups
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const thisMonth = rows.filter((r) => {
      const d = parseISO(r.attendanceDate);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    setMonthlyPresents(thisMonth.filter((i) => i.status === "Present").length);
    setMonthlyAbsents(thisMonth.filter((i) => i.status === "Absent").length);
  }, [rows, setMonthlyAbsents, setMonthlyPresents]);

  // --- Current view rollup
  useEffect(() => {
    const presents = filteredAndSorted.filter(
      (i) => i.status === "Present"
    ).length;
    const absents = filteredAndSorted.filter(
      (i) => i.status === "Absent"
    ).length;
    setCurrentViewAbsent(absents);
    setcurrentViewPresent(presents);
  }, [filteredAndSorted, setCurrentViewAbsent, setcurrentViewPresent]);

  // --- Pagination slices (accurate math)
  const total = filteredAndSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const sliceStart = (page - 1) * PAGE_SIZE;
  const sliceEnd = Math.min(sliceStart + PAGE_SIZE, total);
  const paged = filteredAndSorted.slice(sliceStart, sliceEnd);

  // --- UI handlers
  const handleSort = (columnId: "attendanceDate") => {
    setFilters((f) => {
      if (f.sort?.id === columnId) {
        return { ...f, sort: { id: columnId, desc: !f.sort.desc }, page: 1 };
      }
      return { ...f, sort: { id: columnId, desc: true }, page: 1 };
    });
  };

  const applyPreset = (preset: Preset) => {
    const now = new Date();
    if (preset === "today") {
      setFilters((f) => ({
        ...f,
        preset,
        singleDate: now,
        range: undefined,
        page: 1,
      }));
    } else if (preset === "week") {
      setFilters((f) => ({
        ...f,
        preset,
        singleDate: undefined,
        range: {
          from: startOfWeek(now, { weekStartsOn: 1 }),
          to: endOfWeek(now, { weekStartsOn: 1 }),
        },
        page: 1,
      }));
    } else if (preset === "month") {
      setFilters((f) => ({
        ...f,
        preset,
        singleDate: undefined,
        range: { from: startOfMonth(now), to: endOfMonth(now) },
        page: 1,
      }));
    } else {
      setFilters((f) => ({
        ...f,
        preset: null,
        singleDate: undefined,
        range: undefined,
        page: 1,
      }));
    }
  };

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employeeOptions;
    return employeeOptions.filter((e) =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q)
    );
  }, [employeeOptions, employeeSearch]);

  const toggleEmployee = (employeeId: string) => {
    setFilters((f) => {
      const exists = f.selectedEmployeeIds.includes(employeeId);
      const nextIds = exists
        ? f.selectedEmployeeIds.filter((id) => id !== employeeId)
        : [...f.selectedEmployeeIds, employeeId];
      return { ...f, selectedEmployeeIds: nextIds, page: 1 };
    });
  };

  // --- Render
  return (
    <>
      <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Input
                aria-label="Search attendance"
                placeholder="Search date, status, or time…"
                className="w-[260px] pr-10"
                defaultValue={filters.search}
                onChange={(e) => setSearchDebounced(e.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
            </div>

            {/* Single date */}
            <Popover open={openSingle} onOpenChange={setOpenSingle}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-44 justify-between">
                  <span className="truncate">
                    {filters.singleDate
                      ? format(filters.singleDate, "PP")
                      : "Select date"}
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
                  selected={filters.singleDate}
                  onSelect={(d?: Date) => {
                    setFilters((f) => ({
                      ...f,
                      singleDate: d,
                      range: undefined,
                      preset: d ? "today" : null,
                      page: 1,
                    }));
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
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.range?.from ? (
                    filters.range.to ? (
                      <>
                        {format(filters.range.from, "LLL dd, y")} –{" "}
                        {format(filters.range.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.range.from, "LLL dd, y")
                    )
                  ) : (
                    <span className="text-slate-500">Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CustomDatePicker
                  selected={filters.range}
                  onSelect={(r: DateRange) => {
                    // auto-heal reversed ranges
                    if (!r) {
                      setFilters((f) => ({
                        ...f,
                        range: undefined,
                        singleDate: undefined,
                        preset: null,
                        page: 1,
                      }));
                      return;
                    }

                    const rawFrom = r?.from ?? undefined;
                    const rawTo = r?.to ?? undefined;

                    // If both picked, ensure chronological order, then normalize roles
                    let start = rawFrom;
                    let end = rawTo;

                    if (start && end && start > end) {
                      // swap
                      [start, end] = [end, start];
                    }

                    // Normalize to day-bounds (key bit)
                    const normFrom = start ? startOfDay(start) : undefined;
                    const normTo = end ? endOfDay(end) : undefined;
                    setFilters((f) => ({
                      ...f,
                      range: r ? { from: normFrom, to: normTo } : undefined,
                      singleDate: undefined,
                      // Optional heuristic: only set a preset when both ends exist
                      preset: normFrom && normTo ? "week" : null,
                      page: 1,
                    }));
                  }}
                  footer={
                    <div className="flex w-full items-center justify-between p-2">
                      <div className="text-xs text-slate-500">
                        Tip: drag to select a range
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          setFilters((f) => ({
                            ...f,
                            range: undefined,
                            page: 1,
                          }))
                        }
                        className="text-sm"
                      >
                        Clear
                      </Button>
                    </div>
                  }
                />
              </PopoverContent>
            </Popover>

            {/* Employee filter */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Filter By Employees
                  {filters.selectedEmployeeIds.length > 0 ? (
                    <span className="ml-2 text-xs text-slate-500">
                      ({filters.selectedEmployeeIds.length})
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>Filter By Employees</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Input
                  placeholder="Search employees..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="mb-2 p-2"
                />
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp) => {
                    const checked = filters.selectedEmployeeIds.includes(
                      emp.employee_id
                    );
                    return (
                      <DropdownMenuCheckboxItem
                        key={emp.employee_id}
                        checked={checked}
                        onCheckedChange={() => toggleEmployee(emp.employee_id)}
                        className="!text-black"
                      >
                        {emp.first_name} {emp.last_name}
                      </DropdownMenuCheckboxItem>
                    );
                  })
                ) : (
                  <DropdownMenuCheckboxItem disabled className="!text-gray-400">
                    No employees found
                  </DropdownMenuCheckboxItem>
                )}
                <div className="mt-2 flex gap-2">
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Close
                  </Button>
                  {filters.selectedEmployeeIds.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full"
                      onClick={() =>
                        setFilters((f) => ({
                          ...f,
                          selectedEmployeeIds: [],
                          page: 1,
                        }))
                      }
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Presets */}
            <div className="flex items-center gap-1">
              <Button
                variant={filters.preset === "today" ? "outline" : "ghost"}
                size="sm"
                onClick={() => applyPreset("today")}
                className={
                  filters.preset === "today" ? "!hidden sm:inline-flex" : ""
                }
              >
                Today
              </Button>
              <Button
                variant={filters.preset === "week" ? "outline" : "ghost"}
                size="sm"
                onClick={() => applyPreset("week")}
                className={
                  filters.preset === "week" ? "!hidden sm:inline-flex" : ""
                }
              >
                This week
              </Button>
              <Button
                variant={filters.preset === "month" ? "outline" : "ghost"}
                size="sm"
                onClick={() => applyPreset("month")}
                className={
                  filters.preset === "month" ? "!hidden sm:inline-flex" : ""
                }
              >
                This month
              </Button>
              <Button
                variant={filters.preset === null ? "outline" : "ghost"}
                size="sm"
                onClick={() => applyPreset("clear")}
              >
                Clear
              </Button>
              <div className="flex">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger className="!border-transaparent !p-0">
                    <Button
                      variant="destructive"
                      className="!bg-red-500"
                      size="sm"
                      onClick={() => setOpen(true)}
                    >
                      + More
                    </Button>
                  </SheetTrigger>

                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>More Option</SheetTitle>
                    </SheetHeader>

                    {/* Form wrapper to orchestrate controlled submission */}
                    <form onSubmit={handleSubmit}>
                      <div className="p-2 space-y-4">
                        <Label>Employees</Label>
                        <Select<Option, true>
                          closeMenuOnSelect={false}
                          components={animatedComponents}
                          placeholder="Select Employees"
                          isMulti
                          options={employeeSelectOptions}
                          value={selectedEmployees}
                          onChange={(selected) => {
                            setSelectedEmployees(selected ? [...selected] : []);
                            console.log("Employees selected:", selected);
                          }}
                        />

                        <Label>Attendance Status</Label>
                        <Select<Option, false>
                          closeMenuOnSelect
                          components={animatedComponents}
                          placeholder="Select Status"
                          options={attendanceStatus}
                          value={selectedStatus}
                          onChange={(selected) => {
                            setSelectedStatus(selected);
                            console.log("Status selected:", selected);
                          }}
                          isMulti={false}
                        />

                        <Label>Reason</Label>
                        {/* Note: maxLength limits CHARACTERS; if you truly want 200 words, add a custom validator */}
                        <textarea
                          className="w-full"
                          maxLength={200}
                          placeholder="Max 200 characters allowed"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />

                        <Button
                          className="!bg-sky-500 !text-white !w-full"
                          type="submit"
                          disabled={submitting}
                        >
                          {submitting ? "Submitting..." : "Submit"}
                        </Button>
                      </div>
                    </form>
                  </SheetContent>
                </Sheet>
              </div>
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
        <div className="overflow-auto pr-12">
          <Table className="min-w-full text-sm">
            <TableHeader className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
              <TableRow>
                <TableHead className="whitespace-nowrap">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("attendanceDate")}
                  >
                    Date{" "}
                    {filters.sort?.id === "attendanceDate"
                      ? filters.sort.desc
                        ? "🔽"
                        : "🔼"
                      : ""}
                  </Button>
                </TableHead>
                <TableHead className="whitespace-nowrap">
                  Employee Name
                </TableHead>
                <TableHead className="whitespace-nowrap">Department</TableHead>
                <TableHead className="whitespace-nowrap">Clock In</TableHead>
                <TableHead className="whitespace-nowrap">Clock Out</TableHead>
                <TableHead className="whitespace-nowrap">
                  Total Hours Worked
                </TableHead>
                <TableHead className="whitespace-nowrap">OT</TableHead>
                <TableHead className="whitespace-nowrap">Late</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Created By</TableHead>
                <TableHead className="whitespace-nowrap">Created On</TableHead>
                <TableHead className="whitespace-nowrap">Edited By</TableHead>
                <TableHead className="whitespace-nowrap">Edited On</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-40 text-center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : paged.length > 0 ? (
                paged.map((row) => (
                  <TableRow
                    key={row.id}
                    className="even:bg-slate-50/40 hover:bg-amber-50/60 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {fmtDay(row.attendanceDate)}
                    </TableCell>
                    <TableCell>{row.employeeName ?? "—"}</TableCell>
                    <TableCell>{row.employeeDepartment ?? "—"}</TableCell>
                    <TableCell>
                      {row.clockIn == "" ? "—" : row.clockIn}
                    </TableCell>
                    <TableCell>{row.clockOut ==""? "—":row.clockOut}</TableCell>
                    <TableCell>{row.worked ?? "—"}</TableCell>
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
                    <TableCell>{row.createdBy?.name ?? "—"}</TableCell>
                    <TableCell>{fmtDateTime(row.createdAt)}</TableCell>
                    <TableCell>{row.editedBy?.name ==" "||!row.editedBy?.name? "—":row.editedBy?.name}</TableCell>
                    <TableCell>{fmtDateTime(row.editedAt)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={13}
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
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t p-3 sm:flex-row">
          <div className="text-xs text-slate-600">
            Showing{" "}
            <span className="font-medium">
              {total === 0 ? 0 : sliceStart + 1}
            </span>{" "}
            to <span className="font-medium">{sliceEnd}</span> of{" "}
            <span className="font-medium">{total}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((f) => ({ ...f, page: Math.max(1, page - 1) }))
              }
              disabled={page <= 1}
            >
              Previous
            </Button>
            <div className="text-xs text-slate-600">
              Page <span className="font-medium">{page}</span> / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  page: Math.min(totalPages, page + 1),
                }))
              }
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default EmployeeTable;

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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import makeAnimated from "react-select/animated";
import Select from "react-select";

// ✅ Toast: your in-house provider
import { useToast } from "@/toast/ToastProvider";

// ---------------- constants ----------------
const PAGE_SIZE = 10;
const TRIGGER_INDEX_IN_PAGE = 8; // 0-based → "9th row"

// ---------------- types ----------------
type Checked = DropdownMenuCheckboxItemProps["checked"];
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
  selectedEmployeeIds: string[];
  singleDate?: Date;
  range?: { from?: Date; to?: Date };
  search: string;
  preset: Preset | null;
  sort: SortState;
};

// ---------------- utils ----------------
const asDateOrNull = (val?: unknown): Date | null => {
  if (val == null) return null;
  if (typeof val === "number") {
    const d = new Date(val > 1e12 ? val : val * 1000);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === "string") {
    let d = parseISO(val);
    if (!isNaN(d.getTime())) return d;
    d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
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
  const tz = -d.getTimezoneOffset();
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
  page?: number;
  pageSize?: number;
  search?: string;
}) => {
  console.log(opts);
  const params = new URLSearchParams();
  if (opts.employeeIds?.length)
    params.set("employeeIds", opts.employeeIds.join(","));
  if (opts.today) params.set("today", toOffsetISOString(opts.today));
  if (opts.from) params.set("from", toOffsetISOString(opts.from));
  if (opts.to) params.set("to", toOffsetISOString(opts.to));
  if (opts.page) params.set("page", String(opts.page));
  if (opts.pageSize) params.set("pageSize", String(opts.pageSize));
  if (opts.search) params.set("search", String(opts.search));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

// ---------------- component ----------------
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
  const { attendanceRefresh, user, setAttendanceRefresh } = useAuth();
  const toast = useToast();

  const animatedComponents = makeAnimated();
  // filters (no page here; paging is internal/infinite)
  const [filters, setFilters] = useState<Filters>({
    selectedEmployeeIds: [],
    singleDate: undefined,
    range: undefined,
    search: "",
    preset: null,
    sort: null,
  });

  // data state
  const [employeeOptions, setEmployeeOptions] = useState<Employee[]>([]);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadedPage, setLoadedPage] = useState(0); // how many pages appended

  const [searchDraft, setSearchDraft] = useState<string>("");
  // ui state
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openSingle, setOpenSingle] = useState(false);
  const [openRange, setOpenRange] = useState(false);

  // sheet state
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
    { value: "Present", label: "Present" },
    { value: "Absent", label: "Absent" },
    { value: "On Leave", label: "OnLeave" },
    { value: "Permission", label: "Permission" },
  ];

  // ------------ debounced table search ------------
  const setSearchDebounced = useDebouncedCallback((q: string) => {
    console.log(q, "search string");
    setFilters((f) => ({ ...f, search: q }));
  }, 1200);

  useEffect(() => {
    setSearchDraft(filters.search || "");
  }, [filters.search]);

  const commitSearchDebounced = useDebouncedCallback((next: string) => {
    setFilters((f) => ({ ...f, search: next }));
  }, 3000);

  // defensive: cancel any in-flight debounce on unmount
  useEffect(() => {
    return () => commitSearchDebounced.cancel();
  }, [commitSearchDebounced]);

  // ------------ bootstrap employees (for filters) ------------
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axios.get<Employee[]>("/api/employee/getAllEmployee");
        if (!active) return;
        setEmployeeOptions(res.data ?? []);
      } catch {
        if (!active) return;
        setEmployeeOptions([]);
        toast.warning(
          "Couldn’t load employees for filtering. Try again later.",
          {
            title: "Filter data unavailable",
            durationMs: 3500,
            position: "bottom-center",
          }
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  // ------------ fetch logic (paged) ------------
  const lastAbortRef = useRef<AbortController | null>(null);

  const fetchAttendancePage = useCallback(
    async (pageToLoad: number, isFirstPage: boolean) => {
      // guard: if no more, or already loading for this call
      if (!isFirstPage && (!hasMore || loadingMore)) return;

      // cancel previous request
      lastAbortRef.current?.abort();
      const controller = new AbortController();
      lastAbortRef.current = controller;

      // UX loaders
      if (isFirstPage) {
        setInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      // first page: sticky loader toast; subsequent pages: stay quiet
      const loaderToastId = isFirstPage
        ? toast.info("Fetching attendance…", {
            durationMs: 0,
            position: "top-center",
            dismissible: true,
          })
        : null;

      try {
        console.log(filters);
        const qs = serializeParams({
          employeeIds: filters.selectedEmployeeIds,
          today: filters?.singleDate,
          from: filters.range?.from,
          to: filters.range?.to,
          page: pageToLoad, // 🚀 backend will receive paging signal
          pageSize: PAGE_SIZE,
          search: filters?.search,
        });

        const res = await axios.get(`/api/attendance/getAllAttendance${qs}`, {
          signal: controller.signal,
        });

        const data = res.data?.data ?? [];
        console.log(res.data);
        setRows((prev) => (isFirstPage ? data : [...prev, ...data]));
        setLoadedPage(pageToLoad);
        setHasMore(res?.data.hasMore);
        setMonthlyAbsents(res?.data?.monthSummary?.absent);
        setMonthlyPresents(res?.data?.monthSummary?.present);

        if (loaderToastId) {
          toast.remove(loaderToastId);
          toast.success("Attendance refreshed.", {
            durationMs: 1500,
            position: "top-center",
          });
        }
      } catch (e: any) {
        console.log(e);
        if (axios.isCancel(e)) {
          if (loaderToastId) toast.remove(loaderToastId);
          return;
        }
        setHasMore(false);
        if (loaderToastId) toast.remove(loaderToastId);

        const status = e?.response?.status;
        if (status === 404) {
          // nothing to show
          if (isFirstPage) setRows([]);
          toast.info("No records found for the selected view.", {
            durationMs: 2200,
            position: "bottom-center",
          });
        } else {
          const isNetwork =
            e?.code === "ERR_NETWORK" ||
            e?.message?.toLowerCase?.().includes("network");
          toast.error(
            isNetwork
              ? "Network hiccup while loading attendance. Please retry."
              : "We couldn’t load attendance right now.",
            { title: "Load failed", durationMs: 4000, position: "top-center" }
          );
        }
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    },
    [
      filters.selectedEmployeeIds,
      filters.singleDate,
      filters.range?.from,
      filters.range?.to,
      filters.search,
      hasMore,
      loadingMore,
      toast,
    ]
  );

  // initial + on filter changes → reset and load page 1
  useEffect(() => {
    // setRows([]);
    setHasMore(true);
    setLoadedPage(0);
    fetchAttendancePage(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    attendanceRefresh,
    // key filters to reset on
    filters.selectedEmployeeIds.join(","),
    filters.singleDate?.toString(),
    filters.range?.from?.toString(),
    filters.range?.to?.toString(),
    // sort influences server order (if your API supports it, add it here)
    filters.search,
    filters.sort?.id,
    filters.sort?.desc,
  ]);

  // ------------ client-side search & sort (local) ------------
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

  // ------------ KPI rollups ------------
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const thisMonth = rows.filter((r) => {
      const d = parseISO(r.attendanceDate);
      return d.getMonth() === month && d.getFullYear() === year;
    });

    // setMonthlyPresents(thisMonth.filter((i) => i.status === "Present").length);
    // setMonthlyAbsents(thisMonth.filter((i) => i.status === "Absent").length);
  }, [rows]);

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

  // ------------ IntersectionObserver (lazy load on 9th row) ------------
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerElRef = useRef<HTMLTableRowElement | null>(null);

  // compute the absolute index of the trigger row for the current loaded page
  const triggerIndex =
    loadedPage > 0 ? (loadedPage - 1) * PAGE_SIZE + TRIGGER_INDEX_IN_PAGE : -1;

  useEffect(() => {
    // cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!hasMore) return; // nothing more to load
    if (rows.length < PAGE_SIZE) return; // requirement: only if we have 10 or more rows
    if (!triggerElRef.current) return; // not yet rendered

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          // proactively fetch next page
          fetchAttendancePage(loadedPage + 1, false);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.25, // fire when ~25% visible
      }
    );

    observerRef.current.observe(triggerElRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [rows.length, triggerIndex, hasMore, loadedPage, fetchAttendancePage]);

  // helpers to attach the trigger ref to the correct row
  const attachTriggerRef =
    (index: number) => (el: HTMLTableRowElement | null) => {
      if (index === triggerIndex) {
        triggerElRef.current = el;
      }
    };

  // --------- Employee filter helpers ---------
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
      return { ...f, selectedEmployeeIds: nextIds };
    });
  };

  // --------- Bulk “More Actions” (unchanged UX, just included for completeness) ---------
  const addAttendance = async (payload: {
    employeeIds: string[];
    status: string | null;
    reason: string | null;
    date: Date | string | null;
  }) => {
    return axios.post(`/api/attendance/MoreActions/${user?.userId}`, {
      payload,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedEmployees.length) {
      toast.info("Select at least one employee to proceed.", {
        title: "Nothing to update",
        durationMs: 2500,
        position: "top-center",
      });
      return;
    }
    if (!selectedStatus?.value) {
      toast.warning("Pick an attendance status.", {
        title: "Missing status",
        durationMs: 2500,
        position: "top-center",
      });
      return;
    }
    if (reason.trim().length > 200) {
      toast.warning("Reason is capped at 200 characters.", {
        title: "Too long",
        durationMs: 2500,
        position: "top-center",
      });
      return;
    }
    setAttendanceRefresh(!attendanceRefresh);
    setSubmitting(true);
    const loadingId = toast.info("Applying attendance updates…", {
      durationMs: 0,
      position: "top-center",
      dismissible: true,
    });

    const payload = {
      employeeIds: selectedEmployees.map((o) => o.value),
      status: selectedStatus.value,
      reason: reason.trim() || null,
      date: new Date().toISOString().split("T")[0],
    };

    try {
      await addAttendance(payload);

      toast.remove(loadingId);
      toast.success("Attendance updated successfully.", {
        title: "Done",
        durationMs: 2200,
        position: "top-center",
      });

      setOpen(false);
      setSelectedEmployees([]);
      setSelectedStatus(null);
      setReason("");
    } catch (err: any) {
      toast.remove(loadingId);
      const isNetwork =
        err?.code === "ERR_NETWORK" ||
        err?.message?.toLowerCase?.().includes("network");
      const apiMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      toast.error(
        isNetwork
          ? "Network hiccup while saving. Check your connection and retry."
          : apiMsg || "We couldn’t apply those updates. Please try again.",
        { title: "Update failed", durationMs: 5000, position: "top-center" }
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- render ----------------
  return (
    <>
      {/* Filters + actions shell (unchanged) */}
      <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Input
                aria-label="Search attendance"
                placeholder="Search status, employee, created by, edited by…"
                className="w-[260px] pr-10"
                value={searchDraft}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchDraft(v); // update UI immediately
                  commitSearchDebounced(v); // schedule commit after 3s of silence
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // power users: commit immediately
                    commitSearchDebounced.flush();
                  }
                }}
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
                    let date: Date | undefined;
                    if (d) {
                      date = new Date(d);
                      // date = date_12.setHours(0, 0, 0, 0);
                    }
                    setFilters((f) => ({
                      ...f,
                      singleDate: date,
                      range: undefined,
                      preset: d ? "today" : null,
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
                    if (!r) {
                      setFilters((f) => ({
                        ...f,
                        range: undefined,
                        singleDate: undefined,
                        preset: null,
                      }));
                      return;
                    }
                    const rawFrom = r?.from ?? undefined;
                    const rawTo = r?.to ?? undefined;
                    let start = rawFrom;
                    let end = rawTo;
                    if (start && end && start > end)
                      [start, end] = [end, start];
                    const normFrom = start ? startOfDay(start) : undefined;
                    const normTo = end ? endOfDay(end) : undefined;
                    setFilters((f) => ({
                      ...f,
                      range: r ? { from: normFrom, to: normTo } : undefined,
                      singleDate: undefined,
                      preset: normFrom && normTo ? "week" : null,
                    }));
                  }}
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
                {useMemo(() => {
                  const list =
                    employeeSearch.trim().length === 0
                      ? employeeOptions
                      : employeeOptions.filter((e) =>
                          `${e.first_name} ${e.last_name}`
                            .toLowerCase()
                            .includes(employeeSearch.trim().toLowerCase())
                        );
                  return list.length > 0 ? (
                    list.map((emp) => {
                      const checked = filters.selectedEmployeeIds.includes(
                        emp.employee_id
                      );
                      return (
                        <DropdownMenuCheckboxItem
                          key={emp.employee_id}
                          checked={checked}
                          onCheckedChange={() =>
                            toggleEmployee(emp.employee_id)
                          }
                          className="!text-black"
                        >
                          {emp.first_name} {emp.last_name}
                        </DropdownMenuCheckboxItem>
                      );
                    })
                  ) : (
                    <DropdownMenuCheckboxItem
                      disabled
                      className="!text-gray-400"
                    >
                      No employees found
                    </DropdownMenuCheckboxItem>
                  );
                }, [
                  employeeOptions,
                  employeeSearch,
                  filters.selectedEmployeeIds,
                ])}
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
                        setFilters((f) => ({ ...f, selectedEmployeeIds: [] }))
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
                onClick={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  setFilters((f) => ({
                    ...f,
                    preset: "today",
                    singleDate: today,
                    range: undefined,
                  }));
                  toast.info("Filtered to today.", {
                    durationMs: 1200,
                    position: "bottom-center",
                  });
                }}
                className={
                  filters.preset === "today" ? "!hidden sm:inline-flex" : ""
                }
              >
                Today
              </Button>
              <Button
                variant={filters.preset === "week" ? "outline" : "ghost"}
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setFilters((f) => ({
                    ...f,
                    preset: "week",
                    singleDate: undefined,
                    range: {
                      from: startOfWeek(now, { weekStartsOn: 1 }),
                      to: endOfWeek(now, { weekStartsOn: 1 }),
                    },
                  }));
                  toast.info("Filtered to this week.", {
                    durationMs: 1200,
                    position: "bottom-center",
                  });
                }}
                className={
                  filters.preset === "week" ? "!hidden sm:inline-flex" : ""
                }
              >
                This week
              </Button>
              <Button
                variant={filters.preset === "month" ? "outline" : "ghost"}
                size="sm"
                onClick={() => {
                  const now = new Date();
                  setFilters((f) => ({
                    ...f,
                    preset: "month",
                    singleDate: undefined,
                    range: { from: startOfMonth(now), to: endOfMonth(now) },
                  }));
                  toast.info("Filtered to this month.", {
                    durationMs: 1200,
                    position: "bottom-center",
                  });
                }}
                className={
                  filters.preset === "month" ? "!hidden sm:inline-flex" : ""
                }
              >
                This month
              </Button>
              <Button
                variant={filters.preset === null ? "outline" : "ghost"}
                size="sm"
                onClick={() => {
                  // hard reset all date filters and search
                  commitSearchDebounced.cancel(); // prevent stale pending apply
                  setSearchDraft(""); // clear the input instantly
                  setFilters((f) => ({
                    ...f,
                    preset: null,
                    singleDate: undefined,
                    range: undefined,
                    search: "", // this triggers a fresh page-1 fetch
                  }));
                  toast.info("Cleared filters.", {
                    durationMs: 1200,
                    position: "bottom-center",
                  });
                }}
              >
                Clear
              </Button>

              {/* More actions sheet */}
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

                    <form onSubmit={handleSubmit}>
                      <div className="p-2 space-y-4">
                        <Label>Employees</Label>
                        <Select<Option, true>
                          components={animatedComponents}
                          placeholder="Select Employees"
                          isMulti
                          options={employeeSelectOptions}
                          value={selectedEmployees}
                          onChange={(selected) =>
                            setSelectedEmployees(selected ? [...selected] : [])
                          }
                        />

                        <Label>Attendance Status</Label>
                        <Select<Option, false>
                          closeMenuOnSelect
                          components={animatedComponents}
                          placeholder="Select Status"
                          options={attendanceStatus}
                          value={selectedStatus}
                          onChange={(selected) => setSelectedStatus(selected)}
                          isMulti={false}
                        />

                        <Label>Reason</Label>
                        <textarea
                          className="w-full border-[2px]"
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

      {/* Data table + lazy load sentinel */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="rounded-xl border bg-white shadow-sm"
      >
        <div className="overflow-auto pr-12">
          <Table className="min-w-full text-sm">
            <TableHeader className="sticky top-0 z-10 bg-slate-50/80 backdrop-blur supports-[backdrop-filter]:bg-slate-50/60">
              <TableRow>
                <TableHead className="whitespace-nowrap">Date</TableHead>
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
              {initialLoading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-40 text-center">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length > 0 ? (
                rows.map((row, index) => (
                  <TableRow
                    key={row.id}
                    ref={attachTriggerRef(index)} // 🔔 attach IO to the right row
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
                    <TableCell>
                      {row.clockOut == "" ? "—" : row.clockOut}
                    </TableCell>
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
                    <TableCell>
                      {row.editedBy?.name == " " || !row.editedBy?.name
                        ? "—"
                        : row.editedBy?.name}
                    </TableCell>
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

              {/* Load-more status row */}
              {loadingMore && rows.length > 0 && (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="py-4 text-center text-slate-500"
                  >
                    Loading more…
                  </TableCell>
                </TableRow>
              )}

              {!hasMore && rows.length >= PAGE_SIZE && (
                <TableRow>
                  <TableCell
                    colSpan={13}
                    className="py-4 text-center text-slate-400"
                  >
                    You’re all caught up.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>
    </>
  );
};

export default EmployeeTable;

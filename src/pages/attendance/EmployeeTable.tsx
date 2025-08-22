import React, { useEffect, useMemo, useState } from "react";
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
  isAfter,
  isBefore,
  isSameDay,
  isWithinInterval,
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
import { DateRange, Preset, SortState } from "@/types/attendanceTypes";
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
type Checked = DropdownMenuCheckboxItemProps["checked"];

const EmployeeTable: React.FC<any> = ({
  setMonthlyAbsents,
  setMonthlyPresents,
  setCurrentViewAbsent,
  setcurrentViewPresent,
}) => {
  const [allEmployeeData, setEmployeeData] = useState<any[]>([]);
  const { user, attendanceRefresh } = useAuth();
  const [employeeOptions, setEmployeeOptions] = useState<any[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [dropdownOpen, setDropdownOpen] = React.useState<boolean>(false);

  useEffect(() => {
    // Fetch all employees when the component mounts
    const fetchEmployees = async () => {
      const response = await axios.get("/api/employee/getAllEmployee");
      setEmployeeOptions(response.data); // Assuming the API returns a list of employees
    };

    fetchEmployees();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const filteredEmployees = employeeOptions.filter((employee) => {
    const fullName = (
      employee.first_name +
      " " +
      employee.last_name
    ).toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });
  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployeeIds((prev) => {
      if (prev.includes(employeeId)) {
        return prev.filter((id) => id !== employeeId); // Deselect
      } else {
        return [...prev, employeeId]; // Select
      }
    });
  };

  const [sorting, setSorting] = useState<SortState>(null);
  const [activePreset, setActivePreset] = useState<Preset | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(undefined);
  const [openSingle, setOpenSingle] = useState<boolean>(false);
  const [openRange, setOpenRange] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [loading, setLoading] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState("");
  const handleGetAllEmployeeData = async (
    employeeIds?: String[],
    today?: string,
    from?: Date,
    to?: Date
  ) => {
    try {
      let response;
      const queryParams = [];

      if (employeeIds && employeeIds.length > 0) {
        queryParams.push(`employeeIds=${selectedEmployeeIds.join(",")}`);
      }
      if (today || date) {
        queryParams.push(`today=${today || date}`);
      }
      if ((from && to) || dateRange) {
        queryParams.push(
          `from=${from ? from.toISOString() : dateRange?.from}&to=${
            to ? to.toISOString() : dateRange?.to
          }`
        );
      }
      const queryString = queryParams.length ? `?${queryParams.join("&")}` : "";

      response = await axios.get(
        `/api/attendance/getAllAttendance${queryString}`
      );

      setEmployeeData(response.data.data); // Setting the data to the state
    } catch (error: any) {
      if (error.status) {
        alert("No data found on given filter");
        setDate(undefined)
      } else {
        alert("Something went wrong");
      }
    }
  };

  useEffect(() => {
    if (selectedEmployeeIds && selectedEmployeeIds.length > 0) {
      //   setDate(undefined);
      //   setDateRange(undefined);
      //    setActivePreset( null );
      handleGetAllEmployeeData(selectedEmployeeIds);
    } else {
      handleGetAllEmployeeData([""]);
    }
  }, [selectedEmployeeIds]);
  const debouncedSearch = useDebouncedCallback((query) => {
    setQuery(query);
  }, 500); // 500ms debounce delay

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDebouncedQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const filteredAndSortedData = useMemo(() => {
    let currentData = [...allEmployeeData];

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
  }, [date, dateRange, query, sorting, allEmployeeData, attendanceRefresh]);

  // Monthly aggregates
  useEffect(() => {
    const today = new Date();
    const currentMonthData = allEmployeeData.filter((item) => {
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
  }, [allEmployeeData, attendanceRefresh]);

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
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const paged = filteredAndSortedData.slice((page - 1) * 10, page * 10);

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
      handleGetAllEmployeeData([""], now.toISOString(), undefined, undefined);
    } else if (preset === "week") {
      setDate(undefined);
      setDateRange({
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      });
      handleGetAllEmployeeData(
        [""],
        undefined,
        startOfWeek(now),
        endOfWeek(now)
      );
    } else if (preset === "month") {
      setDate(undefined);
      setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
      handleGetAllEmployeeData(
        [""],
        undefined,
        startOfMonth(now),
        endOfMonth(now)
      );
    } else {
      setDate(undefined);
      setDateRange(undefined);
      handleGetAllEmployeeData();
    }
  };
  //     const handleGetFilteredData = async () => {
  //     const employeeIds = selectedEmployeeIds.join(',');
  //     const response = await axios.get(`/api/attendance/getAttendanceByEmployees/${employeeIds}`);
  //     setEmployeeData(response.data); // Store the filtered data
  //   };

  //   useEffect(() => {
  //     if (selectedEmployeeIds.length > 0) {
  //       handleGetFilteredData();  // Fetch filtered data based on selected employees
  //     }
  //   }, [selectedEmployeeIds]);
  console.log(employeeOptions);
  const handleCloseDropdown = () => {
    setDropdownOpen(false);
  };
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
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <span className="pointer-events-none absolute right-3 top-2.5 text-slate-400">
                <Search className=" w-4 h-4" />
              </span>
            </div>

            <Popover open={openSingle} onOpenChange={setOpenSingle}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-44 justify-between">
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
                  onSelect={(d?: Date) => {
                    
                    setDate(d);
                    if (d) {
                      handleGetAllEmployeeData(
                        [""],
                        d.toISOString(),
                        undefined,
                        undefined
                      );
                   
                    }
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

            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Filter By Employees</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Filter By Employees</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Search Input */}
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="mb-2 p-2"
                />

                {/* Employee List */}
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <DropdownMenuCheckboxItem
                      key={employee.employee_id}
                      checked={selectedEmployeeIds.includes(
                        employee.employee_id
                      )}
                      onCheckedChange={() =>
                        handleEmployeeSelect(employee.employee_id)
                      }
                      className="!text-black"
                    >
                      {employee.first_name} {employee.last_name}
                    </DropdownMenuCheckboxItem>
                  ))
                ) : (
                  <DropdownMenuCheckboxItem disabled className="!text-gray-400">
                    No employees found
                  </DropdownMenuCheckboxItem>
                )}

                {/* Close Button */}
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    onClick={handleCloseDropdown}
                    className="w-full"
                  >
                    Close
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

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
              <div className="flex ">
                <Button variant="destructive" className="!bg-red-500" size="sm">
                  + Mark Absentees
                </Button>
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
          <Table className="min-w-full text-sm ">
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
                <TableHead className="whitespace-nowrap">Edited on</TableHead>
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
                    <TableCell>{row.employeeName || "—"}</TableCell>
                    <TableCell>{row.employeeDepartment || "—"}</TableCell>
                    <TableCell>{row.clockIn || "—"}</TableCell>
                    <TableCell>{row.clockOut || "—"}</TableCell>
                    <TableCell>{row.worked || "—"}</TableCell>
                    <TableCell>{row.ot || "—"}</TableCell>
                    <TableCell>{row.late || "—"}</TableCell>
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
                    <TableCell>{row.createdBy?.name || "—"}</TableCell>
                    <TableCell>{row.createdAt || "—"}</TableCell>
                    <TableCell>{row.editedBy?.name || "—"}</TableCell>
                    <TableCell>{row.editedAt || "—"}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
            Showing <span className="font-medium">{(page - 1) * 10 + 1}</span>{" "}
            to{" "}
            <span className="font-medium">
              {Math.min(page * 10, paged.length)}
            </span>{" "}
            of <span className="font-medium">{paged.length}</span> entries
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
              Page <span className="font-medium">{page}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPage((p: number) =>
                  Math.min(Math.ceil(allEmployeeData.length / 10), p + 1)
                )
              }
              disabled={page === Math.ceil(allEmployeeData.length / 10)}
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

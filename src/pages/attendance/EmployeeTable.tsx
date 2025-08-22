import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";

const EmployeeTable = () => {
  const [allEmployeeData, setEmployeeData] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<any>(undefined);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean } | null>(
    null
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10); // Customize page size as needed

  const handleGetAllEmployeeData = async () => {
    const response = await axios.get("/api/attendance/getAllAttendance");
    setEmployeeData(response.data.data); // Setting the data to the state
  };

  useEffect(() => {
    handleGetAllEmployeeData();
  }, []);

  const handleSort = (columnId: "attendanceDate") => {
    const isDesc = sorting?.desc ?? false;
    setSorting({
      id: columnId,
      desc: !isDesc,
    });
  };

  // Filter logic
  const filteredData = allEmployeeData.filter((item) => {
    const matchesQuery =
      item.attendanceDate.includes(query) ||
      item.status.toLowerCase().includes(query.toLowerCase());
    const matchesDate = date
      ? format(parseISO(item.attendanceDate), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
      : true;
    const matchesDateRange =
      dateRange?.from && dateRange?.to
        ? parseISO(item.attendanceDate) >= dateRange?.from &&
          parseISO(item.attendanceDate) <= dateRange?.to
        : true;

    return matchesQuery && matchesDate && matchesDateRange;
  });

  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

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

            {/* Single date */}
            <Popover open={false} onOpenChange={() => {}}>
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
                  onSelect={(d) => {
                    setDate(d);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* Range date */}
            <Popover open={false} onOpenChange={() => {}}>
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
                  onSelect={setDateRange}
                />
              </PopoverContent>
            </Popover>
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
              {pagedData.length > 0 ? (
                pagedData.map((row) => (
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
            Showing{" "}
            <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, filteredData.length)}
            </span>{" "}
            of <span className="font-medium">{filteredData.length}</span>{" "}
            entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                setPage((p) =>
                  Math.min(Math.ceil(filteredData.length / pageSize), p + 1)
                )
              }
              disabled={page === Math.ceil(filteredData.length / pageSize)}
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

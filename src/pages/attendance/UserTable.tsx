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

interface UserTableProps {
  query: string;
  totalPages: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  total: number;
  page: number;
  pageSize: number;
  paged: any[]; // Change to a more specific type if possible
  handleSort:  (columnId: "attendanceDate") => void
  sorting: { id: string; desc: boolean } | null;
  applyPreset: (preset: Preset) => void;
  activePreset: string | null;
  setQuery: (query: string) => void;
  openSingle: boolean;
  setOpenSingle: (open: boolean) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  setDateRange:React.Dispatch<React.SetStateAction<DateRange>> | undefined;
  setOpenRange: (open: boolean) => void;
  openRange: boolean;
  dateRange: DateRange;
}
    const UserTable: React.FC<UserTableProps> = ({
    query,
    totalPages,
    setPage,
    total,
    page,
    pageSize,
    paged,
    handleSort,
    sorting,
    applyPreset,
    activePreset,
    setQuery,
    openSingle,
    setOpenSingle,
    date,
    setDate,
    setDateRange,
    setOpenRange,
    openRange,
    dateRange,
    }) => {
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
                    if (d) setDateRange&& setDateRange(undefined);
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
                  setDateRange&&  setDateRange(r);
                    if (r?.from || r?.to) setDate(undefined);
                  }}
                  footer={
                    <div className="flex w-full items-center justify-between p-2">
                      <div className="text-xs text-slate-500">
                        Tip: drag to select a range
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setDateRange&&setDateRange(undefined)}
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
                <TableRow>
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
              onClick={() => setPage((p: number) => Math.min(totalPages, p + 1))}
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

// components/attendance/FiltersBar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CustomDatePicker } from "@/components/Daypicker/CustomDatePicker";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CalendarIcon, ChevronDownIcon, Search, Download } from "lucide-react";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from "date-fns";
import { Option, Filters, DateRange, Employee } from "@/types/attendanceTypes";
import { useToast } from "@/toast/ToastProvider";

type Props = {
  searchDraft: string;
  setSearchDraft: (v: string) => void;
  onSearchCommit: (v: string) => void;

  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;

  employeeOptions: Employee[];
  employeeSearch: string;
  setEmployeeSearch: (v: string) => void;
  dropdownOpen: boolean;
  setDropdownOpen: (v: boolean) => void;

  onExportCSV: () => void;
  onExportExcel: () => void;

  onOpenMore: () => void;
};

const FiltersBar: React.FC<Props> = ({
  searchDraft,
  setSearchDraft,
  onSearchCommit,
  filters,
  setFilters,
  employeeOptions,
  employeeSearch,
  setEmployeeSearch,
  dropdownOpen,
  setDropdownOpen,
  onExportCSV,
  onExportExcel,
  onOpenMore,
}) => {
  const toast = useToast();
  const filteredEmployees =
    employeeSearch.trim().length === 0
      ? employeeOptions
      : employeeOptions.filter((e) =>
          `${e.first_name} ${e.last_name}`.toLowerCase().includes(employeeSearch.trim().toLowerCase())
        );

  const toggleEmployee = (employeeId: string) => {
    setFilters((f) => {
      const exists = f.selectedEmployeeIds.includes(employeeId);
      const nextIds = exists ? f.selectedEmployeeIds.filter((id) => id !== employeeId) : [...f.selectedEmployeeIds, employeeId];
      return { ...f, selectedEmployeeIds: nextIds };
    });
  };

  const [openSingle, setOpenSingle] = React.useState(false);
  const [openRange, setOpenRange] = React.useState(false);

  return (
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
                setSearchDraft(v);
                onSearchCommit(v);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchCommit(searchDraft);
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
                  {filters.singleDate ? format(filters.singleDate, "PP") : "Select date"}
                </span>
                <ChevronDownIcon className="h-4 w-4 opacity-70" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.singleDate}
                onSelect={(d?: Date) => {
                  let date: Date | undefined;
                  if (d) date = new Date(d);
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
              <Button variant="outline" className="w-[280px] justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.range?.from ? (
                  filters.range.to ? (
                    <>
                      {format(filters.range.from, "LLL dd, y")} – {format(filters.range.to, "LLL dd, y")}
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
                    setFilters((f) => ({ ...f, range: undefined, singleDate: undefined, preset: null }));
                    return;
                  }
                  const rawFrom = r?.from ?? undefined;
                  const rawTo = r?.to ?? undefined;
                  let start = rawFrom;
                  let end = rawTo;
                  if (start && end && start > end) [start, end] = [end, start];
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
                  <span className="ml-2 text-xs text-slate-500">({filters.selectedEmployeeIds.length})</span>
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
                  const checked = filters.selectedEmployeeIds.includes(emp.employee_id);
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
                <Button variant="ghost" className="w-full" onClick={() => setDropdownOpen(false)}>
                  Close
                </Button>
                {filters.selectedEmployeeIds.length > 0 && (
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setFilters((f) => ({ ...f, selectedEmployeeIds: [] }))}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Presets */}
          <Button
            variant={filters.preset === "today" ? "outline" : "ghost"}
            size="sm"
            onClick={() => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              setFilters((f) => ({ ...f, preset: "today", singleDate: today, range: undefined }));
              toast.info("Filtered to today.", { durationMs: 1200, position: "bottom-left" });
            }}
            className={filters.preset === "today" ? "!hidden sm:inline-flex" : ""}
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
                range: { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfWeek(now, { weekStartsOn: 1 }) },
              }));
              toast.info("Filtered to this week.", { durationMs: 1200, position: "bottom-left" });
            }}
            className={filters.preset === "week" ? "!hidden sm:inline-flex" : ""}
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
              toast.info("Filtered to this month.", { durationMs: 1200, position: "bottom-left" });
            }}
            className={filters.preset === "month" ? "!hidden sm:inline-flex" : ""}
          >
            This month
          </Button>
          <Button
            variant={filters.preset === null ? "outline" : "ghost"}
            size="sm"
            onClick={() => {
              setSearchDraft("");
              setFilters((f) => ({ ...f, preset: null, singleDate: undefined, range: undefined, search: "" }));
              toast.info("Cleared filters.", { durationMs: 1200, position: "bottom-left" });
            }}
          >
            Clear
          </Button>

          {/* Export */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExportCSV} title="Export CSV">
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="default" size="sm" className="!bg-emerald-600" onClick={onExportExcel} title="Export Excel">
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
          </div>

          {/* More actions sheet trigger */}
          <div className="flex">
            <Button variant="destructive" className="!bg-red-500" size="sm" onClick={onOpenMore}>
              + More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;

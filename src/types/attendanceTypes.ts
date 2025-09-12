export type DateRange = { from?: Date; to?: Date } | undefined;

export type SortState = { id: "attendanceDate"; desc: boolean } | null;

export type Preset = "today" | "week" | "month" | "clear";

import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";

export type Checked = DropdownMenuCheckboxItemProps["checked"];
export type Option = { value: string; label: string };
export type Employee = {
  employee_id: string;
  first_name: string;
  last_name: string;
  department?: string | null;
};

export type OTStatus = "Pending" | "Approved" | "Rejected";

export type AttendanceRow = {
  id: string;
  attendanceDate: string; // ISO date
  employeeId?: string;
  employeeName?: string | null;
  employeeDepartment?: string | null;
  clockIn?: string | null;
  clockOut?: string | null;
  worked?: string | null;
  ot?: string | null; // OT hours/duration string (kept)
  late?: string | null;
  status: "Present" | "Absent" | string;
  createdBy?: { name?: string | null } | null;
  createdAt?: string | null; // ISO
  editedBy?: { name?: string | null } | null;
  editedAt?: string | null; // ISO

  // backend-provided or derived
  otStatus?: OTStatus | null;
};

export type Filters = {
  selectedEmployeeIds: string[];
  singleDate?: Date;
  range?: { from?: Date; to?: Date };
  search: string;
  preset: Preset | null;
  sort: SortState;
};

export type AttendanceStatus = "Present" | "Absent";

export type AttendanceRecord = {
  id: string | number;
  attendanceDate: string; // ISO string
  clockIn?: string;
  clockOut?: string;
  worked?: string;
  ot?: string;
  status: AttendanceStatus;
  late?: string;
};

export type DateRange = { from?: Date; to?: Date } | undefined;

export type SortState = { id: "attendanceDate"; desc: boolean } | null;

export type Preset = "today" | "week" | "month" | "clear";


export type AttendanceStatus = "Present" | "Absent";

export type AttendanceRecord ={
  id: string | number;
  attendanceDate: string; // ISO string
  clockIn?: string;
  clockOut?: string;
  ot?: string;
  status: AttendanceStatus;
  late?: string;
}

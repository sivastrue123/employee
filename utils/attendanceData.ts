import { format, parseISO } from "date-fns";

export const attendanceData = [
  {
    id: "1",
    attendanceDate: "2025-08-01",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Present",
  },
  {
    id: "2",
    attendanceDate: "2025-08-02",
    clockIn: "08:55 AM",
    clockOut: "05:15 PM",
    ot: "01:15",
    status: "Present",
  },
  {
    id: "3",
    attendanceDate: "2025-08-03",
    clockIn: "09:05 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Absent",
  },
  {
    id: "4",
    attendanceDate: "2025-08-04",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Present",
  },
  {
    id: "5",
    attendanceDate: "2025-08-05",
    clockIn: "09:10 AM",
    clockOut: "04:50 PM",
    ot: "00:50",
    status: "Present",
  },
  {
    id: "6",
    attendanceDate: "2025-08-06",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Present",
  },
  {
    id: "7",
    attendanceDate: "2025-08-07",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Absent",
  },
  {
    id: "8",
    attendanceDate: "2025-08-08",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Present",
  },
  {
    id: "9",
    attendanceDate: "2025-08-09",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Present",
  },
  {
    id: "10",
    attendanceDate: "2025-08-10",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Absent",
  },
  {
    id: "11",
    attendanceDate: "2025-08-11",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    ot: "01:00",
    status: "Present",
  },
];

export type Attendance = {
  id: string;
  attendanceDate: string;
  clockIn: string;
  clockOut: string;
  worked: string;
  ot: string;
  status: "Present" | "Absent";
  late?: string;
};

export const asDateOrNull = (val?: unknown): Date | null => {
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
export const fmtDay = (input?: unknown) => {
  const d = asDateOrNull(input);
  return d ? format(d, "PPP") : "—";
};
export const fmtDateTime = (input?: unknown) => {
  const d = asDateOrNull(input);
  return d ? format(d, "PP p") : "—";
};
export const pad = (n: number, w = 2) => String(Math.abs(n)).padStart(w, "0");
export const toOffsetISOString = (d: Date) => {
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

export const serializeParams = (opts: {
  employeeIds?: string[];
  today?: Date;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
  search?: string;
}) => {
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

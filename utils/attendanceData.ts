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
  ot: string;
  status: 'Present' | 'Absent';
};
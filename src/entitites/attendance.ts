// attendance.ts
export interface Attendance {
  employee_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  break_duration?: number;
  total_hours?: number;
  overtime_hours?: number;
  status?: "present" | "absent" | "late" | "half_day";
  notes?: string;
}

export const Attendance = {
  async list(): Promise<Attendance[]> {
    return [
      {
        employee_id: "emp001",
        date: "2024-08-10",
        clock_in: "09:00",
        clock_out: "18:00",
        break_duration: 60,
        total_hours: 8,
        status: "present",
      },
      {
        employee_id: "emp002",
        date: "2024-08-10",
        status: "absent",
      },
    ];
  },
};

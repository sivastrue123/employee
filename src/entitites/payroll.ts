export interface Payroll {
  employee_id: string;
  pay_period_start: string;  // or Date if you prefer
  pay_period_end: string;
  regular_hours?: number;
  overtime_hours?: number;
  hourly_rate?: number;
  regular_pay?: number;
  overtime_pay?: number;
  gross_pay?: number;
  deductions?: number;
  net_pay?: number;
  status?: "draft" | "approved" | "paid";
}


import { format, parseISO, isAfter } from "date-fns";
import { Employee, TaskStatus } from "@/types/projectTypes";
import { type ProjectStatus } from "./projectData.js";

export const pageSize = 10;

export const genId = (prefix: string) =>
  `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;

export const toISOFromDateInput = (val: string) =>
  val ? new Date(val + "T00:00:00").toISOString() : undefined;

export const employeeFullName = (e: Employee) =>
  `${e.first_name ?? ""} ${e.last_name ?? ""}`.trim();

export const isOverdue = (dueISO?: string, actualISO?: string) => {
  if (!dueISO) return false;
  const due = parseISO(dueISO);
  if (actualISO) {
    const actual = parseISO(actualISO);
    return actual.getTime() > due.getTime();
  }
  return Date.now() > due.getTime();
};

export const formatMaybe = (iso?: string) =>
  iso ? format(parseISO(iso), "PPP") : "—";

// Map your status tokens to badge variants (adjust to your design tokens)
export const statusVariant = (
  s: ProjectStatus
): "default" | "secondary" | "destructive" => {
  switch (s) {
    case "On Track":
      return "default";
    case "At Risk":
      return "secondary";
    case "Blocked":
      return "destructive";
  }
};

export const taskStatusClass = (s: TaskStatus) =>
  ({
    "Not Started": "border-slate-300 text-slate-700 bg-slate-50",
    "In Progress": "border-blue-300 text-blue-700 bg-blue-50",
    Completed: "border-green-300 text-green-700 bg-green-50",
  }[s]!);

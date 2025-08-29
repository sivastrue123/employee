import { Project } from "utils/projectData";

export type SortId = "name" | "owner" | "dueDate" | "progress";
export type SortState = { id: SortId; desc: boolean } | null;

export type Employee = {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
  department?: string;
  position?: string;
  status?: string;
  profile_image?: string;
};

export type ChecklistItem = { _id?: string; text: string; done: boolean };
export type TaskPriority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "Not Started" | "In Progress" | "Completed";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus; // NEW
  startDate?: string; // ISO
  dueDate?: string; // ISO
  actualEndDate?: string; // ISO
  estimatedHours?: number;
  assigneeEmployeeIds: string[]; // employee_id values
  checklist: ChecklistItem[];
};

export type ProjectWithTasks = Project & { tasks: Task[] };

export type Option = { value: string; label: string };

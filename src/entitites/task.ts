// task.ts
export interface Task {
  project_id: string;
  title: string;
  description?: string;
  assigned_to: string;
  status?: "todo" | "in_progress" | "review" | "completed";
  priority?: "low" | "medium" | "high" | "critical";
  estimated_hours?: number;
  actual_hours?: number;
  start_date?: string;
  due_date?: string;
  completion_date?: string;
}

export const Task = {
  async list(): Promise<Task[]> {
    return [
      {
        project_id: "Website Redesign",
        title: "Create wireframes",
        description: "Design wireframes for homepage",
        assigned_to: "emp002",
        status: "in_progress",
        priority: "high",
        estimated_hours: 20,
        start_date: "2024-06-05",
        due_date: "2024-06-20",
      },
    ];
  },
};

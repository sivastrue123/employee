// project.ts
export interface Project {
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  status?: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  priority?: "low" | "medium" | "high" | "critical";
  budget?: number;
  client?: string;
  manager_id: string;
}

export const Project = {
  async list(): Promise<Project[]> {
    return [
      {
        name: "Website Redesign",
        description: "Redesign client website",
        start_date: "2024-06-01",
        end_date: "2024-08-31",
        status: "active",
        priority: "high",
        budget: 50000,
        client: "Acme Corp",
        manager_id: "emp001",
      },
    ];
  },
};
  
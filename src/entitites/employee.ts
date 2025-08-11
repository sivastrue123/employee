// employee.ts
export interface Employee {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position: string;
  department: "Engineering" | "Marketing" | "Sales" | "HR" | "Finance" | "Operations" | "Design";
  hire_date?: string;
  hourly_rate: number;
  status?: "active" | "inactive" | "terminated";
  manager_id?: string;
  profile_image?: string;
}

export const Employee = {
  async list(): Promise<Employee[]> {
    return [
      {
        id: "emp001",
        first_name: "Siva",
        last_name: "M",
        email: "siva@example.com",
        position: "Developer",
        department: "Engineering",
        hire_date: "2023-01-15",
        hourly_rate: 25,
        status: "active",
      },
      {
        id: "emp002",
        first_name: "Ravi",
        last_name: "K",
        email: "ravi@example.com",
        position: "Designer",
        department: "Design",
        hire_date: "2022-08-01",
        hourly_rate: 30,
        status: "active",
      },
      {
        id: "emp002",
        first_name: "Ravi",
        last_name: "K",
        email: "ravi@example.com",
        position: "Designer",
        department: "Design",
        hire_date: "2022-08-01",
        hourly_rate: 30,
        status: "active",
      },
      {
        id: "emp002",
        first_name: "Ravi",
        last_name: "K",
        email: "ravi@example.com",
        position: "Designer",
        department: "Design",
        hire_date: "2022-08-01",
        hourly_rate: 30,
        status: "active",
      },
      {
        id: "emp002",
        first_name: "Ravi",
        last_name: "K",
        email: "ravi@example.com",
        position: "Designer",
        department: "Design",
        hire_date: "2022-08-01",
        hourly_rate: 30,
        status: "active",
      },
    ];
  },
};

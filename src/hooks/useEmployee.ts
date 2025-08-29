// hooks/useEmployees.ts
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Employee, Option } from "@/types/projectTypes";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  useEffect(() => {
    (async () => {
      const response = await axios.get("/api/employee/getAllEmployee");
      setEmployees(response?.data ?? []);
    })();
  }, []);

  const employeesById = useMemo(() => {
    const m = new Map<string, Employee>();
    employees.forEach((e) => m.set(e.employee_id, e));
    return m;
  }, [employees]);

  const employeeSelectOptions: Option[] = useMemo(
    () =>
      employees.map((emp) => ({
        value: emp.employee_id,
        label: `${emp.first_name} ${emp.last_name}`.trim() || emp.email,
      })),
    [employees]
  );

  return { employees, employeesById, employeeSelectOptions };
}

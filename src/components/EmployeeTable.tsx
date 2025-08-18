import React from "react";
import { Employee } from "@/entitites/employee";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { MoreHorizontal, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface EmployeeTableProps {
  employees: Employee[] | null;
  onEdit: (employee: Employee) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, onEdit }) => {
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        No employees found.
      </div>
    );
  }

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.employee_id}>
              <TableCell className="font-medium">
                {employee.first_name} {employee.last_name}
              </TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    employee.status === "active" ? "default" : "secondary"
                  }
                  className={
                    employee.status === "active"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {employee.phone}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  {employee.hire_date
                    ? format(new Date(employee.hire_date), "MMM d, yyyy")
                    : "N/A"}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  onClick={() => onEdit(employee)}
                  size="icon"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;

import React, { useState, useEffect } from "react";
import { Employee } from "@/entitites/employee";
// import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

import EmployeeCard from "@/components/EmployeeCard";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeeFilters from "@/components/EmployeeFilters";
import axios from "axios";
import { useLocation } from "react-router-dom";
export default function Employees() {
  const location = useLocation();
  console.log(location.search);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployeesList, setFilteredEmployeesList] = useState<
    Employee[] | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showForm, setShowForm] = useState(
    location.search == "?AddEmployee" ? true : false
  );
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadEmployees();
    // loadCurrentUser();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, selectedDepartment, selectedStatus]);

  // const loadCurrentUser = async () => {
  //   try {
  //     const user = await User.me();
  //     setCurrentUser(user);
  //   } catch (error) {
  //     console.error("Error loading current user:", error);
  //   }
  // };

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      axios
        .get("/api/employee/getAllEmployee")
        .then((response) => setEmployees(response.data))
        .catch((error) => console.error("Error fetching data:", error));
    } catch (error) {
      console.error("Error loading employees:", error);
    }
    setIsLoading(false);
  };

  const filterEmployees = () => {
    let filtered = employees;

    if (searchTerm) {
      filtered = filtered.filter(
        (emp) =>
          emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (emp) => emp.department === selectedDepartment
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((emp) => emp.status === selectedStatus);
    }

    setFilteredEmployeesList(filtered);
  };

  // const handleSaveEmployee = async (employeeData:Employee) => {
  //   try {
  //     if (editingEmployee) {
  //       await Employee.update(editingEmployee.id, employeeData);
  //     } else {
  //       await Employee.create({
  //         ...employeeData,
  //         employee_id: `EMP${Date.now()}`
  //       });
  //     }
  //     setShowForm(false);
  //     setEditingEmployee(null);
  //     loadEmployees();
  //   } catch (error) {
  //     console.error("Error saving employee:", error);
  //   }
  // };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  // const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="flex-1 p-6 lg:px-10 !lg:pr-8 space-y-8 w-full h-auto">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <p className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Team Members
          </p>
          <p className="text-lg text-slate-600">
            Manage your workforce efficiently
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingEmployee(null);
            setShowForm(true);
          }}
          className="!bg-sky-400 hover:!bg-slate-800 !text-black hover:!text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="flex flex-col  lg:flex-row gap-4 items-center ">
        <div className="relative rounded-[8px] w-[50%] bg-white">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 !text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search employees By Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!pl-10 py-5 !border-slate-200  !focus:border-slate-400 !focus:ring-slate-400"
          />
        </div>

        <EmployeeFilters
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card
                key={i}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse"
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-full" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                      <div className="h-3 bg-slate-200 rounded w-24" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence>
            {filteredEmployeesList &&
              filteredEmployeesList.map((employee, index) => (
                <EmployeeCard
                  key={index}
                  employee={employee}
                  onEdit={(e: any) => {
                    handleEditEmployee(e);
                  }}
                  canEdit={"admin"}
                />
              ))}
          </AnimatePresence>
        </motion.div>
      )}

      {!isLoading &&
        filteredEmployeesList &&
        filteredEmployeesList.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center  grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  items-center py-12 "
            layout
          >
            <div className="w-full">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No employees found
              </h3>
              <p className="text-slate-500">
                Try adjusting your search or filters
              </p>
            </div>
          </motion.div>
        )}

      <AnimatePresence>
        {showForm && (
          <EmployeeForm
            employee={editingEmployee}
            onSave={() => {
              loadEmployees();
              setShowForm(false);
            }}
            onCancel={() => {
              setShowForm(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

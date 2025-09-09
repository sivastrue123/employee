import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios, { CancelTokenSource } from "axios";

import { Employee } from "@/entitites/employee";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader } from "@/components/ui/card";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

import { Users, Plus, Search, LayoutGrid, Table } from "lucide-react";

import EmployeeCard from "@/components/EmployeeCard";
import EmployeeForm from "@/components/EmployeeForm";
import EmployeeFilters from "@/components/EmployeeFilters";
import EmployeeTable from "@/components/EmployeeTable";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/toast/ToastProvider";
import { api } from "@/lib/axios";

type ViewMode = "grid" | "table";
type ApiEmployee = Employee;

const ADD_EMPLOYEE_QP = "AddEmployee";
const isAddEmployeeParam = (search: string) => {
  const params = new URLSearchParams(search);
  return params.has(ADD_EMPLOYEE_QP) || params.get("modal") === ADD_EMPLOYEE_QP;
};

const normalize = (v?: string) => (v ?? "").toLowerCase().trim();

export default function Employees() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const [employees, setEmployees] = useState<ApiEmployee[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [editingEmployee, setEditingEmployee] = useState<ApiEmployee | null>(
    null
  );
  const [showForm, setShowForm] = useState<boolean>(
    isAddEmployeeParam(location.search)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // keep track of mounted state to avoid setState after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.warning("You don’t have access to Employee Management.", {
        title: "Access limited",
        durationMs: 3500,
        position: "bottom-center",
      });
      navigate("/Attendance", { replace: true });
    }
  }, [user]);

  useEffect(() => {
    setShowForm(isAddEmployeeParam(location.search));
  }, [location.search]);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  const loadEmployees = useCallback(async () => {
    let cancelSource: CancelTokenSource | null = axios.CancelToken.source();
    setIsLoading(true);
    setError(null);

    const loadingId = toast.info("Fetching Employees...", {
      durationMs: 0,
      position: "bottom-center",
      dismissible: true,
    });

    try {
      const res = await api.get<ApiEmployee[]>("/api/employee/getAllEmployee", {
        cancelToken: cancelSource.token,
      });
      if (isMountedRef.current) {
        setEmployees(res.data ?? []);

        toast.remove(loadingId);
        toast.success("Employee Data refreshed.", {
          durationMs: 1800,
          position: "bottom-center",
        });
      }
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        console.error("Error loading employees:", err);
        if (isMountedRef.current) setError(err);
        toast.remove(loadingId);
        const isNetwork =
          err?.code === "ERR_NETWORK" ||
          err?.message?.toLowerCase()?.includes("network");
        toast.error(
          isNetwork
            ? "Network hiccup while loading employees. Please check your connection and retry."
            : "We couldn’t load employees right now. Please try again.",
          { title: "Load failed", durationMs: 4500, position: "bottom-center" }
        );
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }

    return () => cancelSource?.cancel("component unmounted");
  }, [toast]);

  useEffect(() => {
    const cleanup = loadEmployees();
    return () => {
      Promise.resolve(cleanup).then((fn) => {
        if (typeof fn === "function") fn();
      });
    };
  }, [loadEmployees]);

  // memoized filtered list
  const filteredEmployees = useMemo(() => {
    const q = normalize(debouncedSearch);
    return employees
      .filter((emp) => {
        if (!q) return true;
        return (
          normalize(emp.first_name).includes(q) ||
          normalize(emp.last_name).includes(q) ||
          normalize(emp.email).includes(q) ||
          normalize((emp as any).position).includes(q)
        );
      })
      .filter((emp) =>
        selectedDepartment === "all"
          ? true
          : emp.department === selectedDepartment
      )
      .filter((emp) =>
        selectedStatus === "all" ? true : emp.status === selectedStatus
      );
  }, [employees, debouncedSearch, selectedDepartment, selectedStatus]);

  // one-shot "no results" notifier that won’t spam while typing
  const hasAnnouncedNoResultsRef = useRef(false);
  useEffect(() => {
    const hasQueryOrFilter =
      normalize(debouncedSearch).length > 0 ||
      selectedDepartment !== "all" ||
      selectedStatus !== "all";

    if (!isLoading && hasQueryOrFilter) {
      if (filteredEmployees.length === 0 && !hasAnnouncedNoResultsRef.current) {
        toast.info("No matching employees. Try adjusting filters.", {
          durationMs: 2500,
          position: "bottom-center",
        });
        hasAnnouncedNoResultsRef.current = true;
      } else if (filteredEmployees.length > 0) {
        hasAnnouncedNoResultsRef.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredEmployees.length,
    debouncedSearch,
    selectedDepartment,
    selectedStatus,
    isLoading,
  ]);

  // handlers
  const openAddForm = useCallback(() => {
    setEditingEmployee(null);
    setShowForm(true);
    const params = new URLSearchParams(location.search);
    params.set(ADD_EMPLOYEE_QP, "");
    navigate({ search: `?${ADD_EMPLOYEE_QP}` }, { replace: false });

    toast.info("Add a new team member.", {
      title: "Create employee",
      durationMs: 2200,
      position: "bottom-center",
    });
  }, [location.search, navigate, toast]);

  const closeForm = useCallback(() => {
    setShowForm(false);
    const params = new URLSearchParams(location.search);
    params.delete(ADD_EMPLOYEE_QP);
    if (params.get("modal") === ADD_EMPLOYEE_QP) params.delete("modal");
    navigate(
      { search: params.toString() ? `?${params.toString()}` : "" },
      { replace: true }
    );
  }, [location.search, navigate]);

  const handleEditEmployee = useCallback(
    (employee: ApiEmployee) => {
      setEditingEmployee(employee);
      setShowForm(true);
      toast.info(`Editing ${employee.first_name} ${employee.last_name}.`, {
        durationMs: 2000,
        position: "bottom-center",
      });
    },
    [toast]
  );

  const handleAfterSave = useCallback(() => {
    // optimistic success confirmation (EmployeeForm calls this after a successful persist)
    toast.success("Employee details saved.", {
      title: "Changes applied",
      durationMs: 2200,
      position: "bottom-center",
    });
    loadEmployees(); // refresh and close
    closeForm();
  }, [closeForm, loadEmployees, toast]);

  const switchToGrid = () => {
    setViewMode("grid");
    toast.info("Switched to grid view.", {
      durationMs: 1200,
      position: "bottom-center",
    });
  };

  const switchToTable = () => {
    setViewMode("table");
    toast.info("Switched to table view.", {
      durationMs: 1200,
      position: "bottom-center",
    });
  };

  return (
    <div
      className={`flex-1 ${
        viewMode == "table" ? "lg:pl-14 lg:pr-10" : "lg:px-10"
      }  !lg:pr-8 space-y-4 lg:space-y-8 w-full h-auto`}
    >
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Team Members
          </p>
          <p className="text-lg text-slate-600">
            Manage your workforce efficiently
          </p>
        </div>

        <Button
          onClick={openAddForm}
          className="!bg-sky-400 hover:!bg-slate-800 !text-black hover:!text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="relative rounded-[8px] w-full md:w-1/2 bg-white">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search employees by name, email, or position"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 py-5 border-slate-200 focus:border-slate-400 focus:ring-slate-400"
            aria-label="Search employees"
          />
        </div>

        <EmployeeFilters
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          We couldn&apos;t load some data. Showing what we can.
        </div>
      )}

      {isLoading ? (
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6  ">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse !w-[300px] !h-[330px]">
              <CardHeader className="!w-full ">
                <div className="flex ">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-16 h-16 bg-slate-200 rounded-full w-full" />
                    <div className="space-y-2 w-full">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                      <div className="h-3 bg-slate-200 rounded w-24" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-6">
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <div className="flex justify-end w-full lg:px-12">
            <div className="flex items-center w-[90px] gap-2 pb-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "outline"}
                      onClick={switchToGrid}
                      className={
                        viewMode === "grid"
                          ? "!bg-sky-400"
                          : "!bg-white !shadow-md"
                      }
                      size="icon"
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "table" ? "secondary" : "outline"}
                      onClick={switchToTable}
                      className={
                        viewMode === "table"
                          ? "!bg-sky-400"
                          : "!bg-white !shadow-md"
                      }
                      size="icon"
                      aria-label="Table view"
                    >
                      <Table className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Table</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {viewMode === "grid" && (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              layout
            >
              {filteredEmployees.map((employee, index) => (
                <EmployeeCard
                  key={employee.employee_id ?? index}
                  employee={employee}
                  onEdit={handleEditEmployee}
                  canEdit={"admin"}
                />
              ))}
            </motion.div>
          )}

          {viewMode === "table" && (
            <motion.div
              key="table-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full overflow-x-auto"
            >
              <EmployeeTable
                employees={filteredEmployees}
                onEdit={handleEditEmployee}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {!isLoading && filteredEmployees.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-center py-12"
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
            onSave={handleAfterSave}
            onCancel={() => {
              toast.info("No changes were saved.", {
                durationMs: 1800,
                position: "bottom-center",
              });
              closeForm();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

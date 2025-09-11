// src/pages/Dashboard.tsx  (your file, edited)
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  FolderOpen,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import StatsCards from "../components/StatsCards";
import AttendanceOverview from "../components/AttendanceOverview";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/toast/ToastProvider";
import { api } from "@/lib/axios";
import { QuickActionsCard } from "@/widgets/QuickActionsCard"; // ⬅️ new import
import { useSidebar } from "@/components/ui/sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, attendanceRefresh } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setdashboardData] = useState<any>();
const {state}=useSidebar()
  const handleAddEmployee = useCallback(() => {
    navigate("/Employees?AddEmployee");
  }, [navigate]);

  const greetingName = useMemo(
    () => user?.name || user?.displayName || "there",
    [user]
  );

  const handleGetAllDashboardData = async () => {
    try {
      setIsLoading(true);
      const loadingId = toast.info("Fetching Dashboard Data...", {
        durationMs: 1000,
        position: "bottom-left",
        dismissible: true,
      });
      const response = await api.get("/api/employee/getDashboardData");
      if (response?.status === 200) {
        setdashboardData(response?.data);
        toast.remove(loadingId);
        toast.success("Data Fetched Successfully", {
          durationMs: 1000,
          position: "bottom-left",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") handleGetAllDashboardData();
  }, [attendanceRefresh]);
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.warning("You don’t have access to Dashboard.", {
        title: "Access limited",
        durationMs: 3500,
        position: "bottom-left",
      });
      navigate("/Attendance", { replace: true });
    }
  }, [user]);

  return (
    <div className={`flex flex-col ${state=="expanded"?"lg:w-[90%]":"lg:w-full"} w-full min-w-0 h-auto px-4 lg:px-8 py-6 box-border`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 flex flex-col items-start md:mb-4"
      >
        <p className="text-3xl lg:text-4xl font-bold text-slate-900">
          Welcome back, {greetingName}
        </p>
        <p className="text-lg text-slate-600">
          Here&apos;s what&apos;s happening with your team today
        </p>
      </motion.div>

      {/* KPI Grid → each card now links to its screen */}
      <div
        className="
    grid gap-4 my-4 mb-8
    grid-cols-4
    min-w-0
  "
      >
        <StatsCards
          title="Total Employees"
          value={dashboardData?.totalEmployees?.count}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
          change={dashboardData?.totalEmployees?.diff}
          isLoading={isLoading}
          to="Employees"
        />
        <StatsCards
          title="Active Projects"
          value={dashboardData?.activeProjects?.count}
          icon={FolderOpen}
          gradient="from-purple-500 to-purple-600"
          change={dashboardData?.activeProjects?.diff}
          isLoading={isLoading}
          to="Projects"
        />
        <StatsCards
          title="Current Month Attendance"
          value={dashboardData?.thisMonthAttendance?.count}
          icon={Clock}
          gradient="from-green-500 to-green-600"
          change={dashboardData?.thisMonthAttendance?.diff}
          isLoading={isLoading}
          to="Attendance"
        />
        <StatsCards
          title="Completed Tasks"
          value={dashboardData?.completedTasks?.count}
          icon={CheckCircle2}
          gradient="from-orange-500 to-orange-600"
          change={dashboardData?.completedTasks?.diff}
          isLoading={isLoading}
          to="Attendance"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AttendanceOverview
            isLoading={!!isLoading}
            data={dashboardData?.attendaneState}
          />
        </div>

        <div className="space-y-6">
          {/* Reusable Quick Actions widget */}
          <QuickActionsCard
            title={
              <span className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Quick Actions
              </span>
            }
            actions={[
              // You can add more actions here; they can navigate or call functions
              {
                label: "Add New Employee",
                icon: Users,
                onClick: handleAddEmployee,
              },
              // { label: "Open Attendance", icon: Clock, to: "/Attendance" },
              // { label: "View Projects", icon: FolderOpen, to: "/Projects" },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

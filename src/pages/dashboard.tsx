import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  Users,
  Clock,
  FolderOpen,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatsCards from "../components/StatsCards";
import AttendanceOverview from "../components/AttendanceOverview";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/toast/ToastProvider";
import { api } from "@/lib/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, attendanceRefresh } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setdashboardData] = useState<any>();
  const handleAddEmployee = useCallback(() => {
    navigate("/Employees?AddEmployee");
  }, [navigate]);

  const greetingName = useMemo(() => {
    return user?.name || user?.displayName || "there";
  }, [user]);

  const handleGetAllDashboardData = async () => {
    try {
      setIsLoading(true);
      const loadingId = toast.info("Fetching Dashboard Data...", {
        durationMs: 1000,
        position: "bottom-center",
        dismissible: true,
      });
      const response = await api.get("/api/employee/getDashboardData");
      if (response?.status == 200) {
        setIsLoading(false);
        toast.remove(loadingId);
        setdashboardData(response?.data);
        toast.success("Data Fetched Successfully", {
          durationMs: 1000,
          position: "bottom-center",
          dismissible: true,
        });
      }
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role == "admin") {
      handleGetAllDashboardData();
    }
  }, [attendanceRefresh]);
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.warning("You don’t have access to Dashboard.", {
        title: "Access limited",
        durationMs: 3500,
        position: "bottom-center",
      });
      navigate("/Attendance", { replace: true });
    }
  }, [user]);

  return (
    <div className="flex flex-col w-full max-w-full h-auto px-4 lg:px-8 py-6 overflow-hidden box-border">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-4 mb-8">
        <StatsCards
          title="Total Employees"
          value={dashboardData?.totalEmployees?.count}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
          change={dashboardData?.totalEmployees?.diff}
          isLoading={isLoading}
        />
        <StatsCards
          title="Active Projects"
          value={dashboardData?.activeProjects?.count}
          icon={FolderOpen}
          gradient="from-purple-500 to-purple-600"
          change={dashboardData?.activeProjects?.diff}
          isLoading={isLoading}
        />
        <StatsCards
          title="Current Month Attendance"
          value={dashboardData?.thisMonthAttendance?.count}
          icon={Clock}
          gradient="from-green-500 to-green-600"
          change={dashboardData?.thisMonthAttendance?.diff}
          isLoading={isLoading}
        />
        <StatsCards
          title="Completed Tasks"
          value={dashboardData?.completedTasks?.count}
          icon={CheckCircle2}
          gradient="from-orange-500 to-orange-600"
          change={dashboardData?.completedTasks?.diff}
          isLoading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AttendanceOverview
            isLoading={isLoading as boolean}
            data={dashboardData?.attendaneState}
          />
          {/* if needed we need to use this component for displayin all the client's progress */}
          {/* <ProjectProgress isLoading={isLoading} /> */}
        </div>

        <div className="space-y-6">
          {/* there is no need for recent activity if needed create an api and use this component */}
          {/* <RecentActivity activities={recentActivities} isLoading={isLoading} /> */}

          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* to access this feature we need to centralized the clockin function(global state) */}
              {/* <Button
                variant="secondary"
                className="w-full justify-start !bg-white/10 hover:!bg-white/20 !text-white border-0"
              >
                <Clock className="w-4 h-4 mr-2" />
                Clock In/Out
              </Button> */}
              <Button
                variant="secondary"
                className="w-full justify-start !bg-white/10 hover:!bg-white/20 !text-white border-0"
                onClick={handleAddEmployee}
              >
                <Users className="w-4 h-4 mr-2" />
                Add New Employee
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

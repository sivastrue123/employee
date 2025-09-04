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

import { Employee } from "@/entitites/employee";
import { Attendance } from "@/entitites/attendance";
import { Project } from "@/entitites/project";
import { Task } from "@/entitites/task";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import StatsCards from "../components/StatsCards";
import RecentActivity from "../components/RecentActivity";
import AttendanceOverview from "../components/AttendanceOverview";
import ProjectProgress from "../components/ProjectProcess";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/toast/ToastProvider";

// ===== Types =====
type StatBlock = {
  totalEmployees: number;
  activeProjects: number;
  todayAttendance: number;
  completedTasks: number;
};

type ActivityItem = {
  id: number | string;
  type: "attendance" | "task" | "project" | string;
  message: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
};

// ===== Constants =====
const DATE_FMT = "yyyy-MM-dd";

// Prefer a single, testable function for computing stats
function computeStats(
  employees: Array<{ status?: string }> = [],
  projects: Array<{ status?: string }> = [],
  tasks: Array<{ status?: string }> = [],
  attendance: Array<{ status?: string; date?: string }> = []
): StatBlock {
  const todayStr = format(new Date(), DATE_FMT);

  return {
    totalEmployees: employees.filter((e) => e.status === "active").length,
    activeProjects: projects.filter((p) => p.status === "active").length,
    todayAttendance: attendance.filter(
      (a) => a.status === "present" && a.date === todayStr
    ).length,
    completedTasks: tasks.filter((t) => t.status === "completed").length,
  };
}

// Co-locate mock/demo data with component to make replacement easy later
const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    type: "attendance",
    message: "John Smith clocked in",
    time: "2 minutes ago",
    icon: Clock,
    color: "text-green-600",
  },
  {
    id: 2,
    type: "task",
    message: 'Task "UI Design" completed',
    time: "15 minutes ago",
    icon: CheckCircle2,
    color: "text-blue-600",
  },
  {
    id: 3,
    type: "project",
    message: 'New project "Mobile App" created',
    time: "1 hour ago",
    icon: FolderOpen,
    color: "text-purple-600",
  },
];

// ===== Custom Hook (single responsibility: data for dashboard) =====
function useDashboardData() {
  const [stats, setStats] = useState<StatBlock>({
    totalEmployees: 0,
    activeProjects: 0,
    todayAttendance: 0,
    completedTasks: 0,
  });
  const [recentActivities, setRecentActivities] =
    useState<ActivityItem[]>(DEMO_ACTIVITIES);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown | any>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        // If any endpoint fails, we still want to fail-fast with a clear error.
        const [employees, projects, tasks, attendance] = await Promise.all([
          Employee.list(),
          Project.list(),
          Task.list(),
          Attendance.list(),
        ]);

        if (!isMounted) return;

        setStats(computeStats(employees, projects, tasks, attendance));

        // Replace this with real activity feed when available
        setRecentActivities(DEMO_ACTIVITIES);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error loading dashboard data:", err);
        setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, recentActivities, isLoading, error };
}

// ===== Component =====
export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const { stats, recentActivities, isLoading, error } = useDashboardData();

  const handleAddEmployee = useCallback(() => {
    navigate("/Employees?AddEmployee");
  }, [navigate]);

  const greetingName = useMemo(() => {
    // Fallback to a friendly generic if user or name missing
    return user?.name || user?.displayName || "there";
  }, [user]);

  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.warning("You don’t have access to Dashboard.", {
        title: "Access limited",
        durationMs: 3500,
        position: "bottom-center",
      });
      navigate("/Attendance", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          We couldn&apos;t refresh some data. Attempting to show the latest
          available info.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-4 mb-8">
        <StatsCards
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          gradient="from-blue-500 to-blue-600"
          change="+12%"
          isLoading={isLoading}
        />
        <StatsCards
          title="Active Projects"
          value={stats.activeProjects}
          icon={FolderOpen}
          gradient="from-purple-500 to-purple-600"
          change="+8%"
          isLoading={isLoading}
        />
        <StatsCards
          title="Today's Attendance"
          value={stats.todayAttendance}
          icon={Clock}
          gradient="from-green-500 to-green-600"
          change=""
          isLoading={isLoading}
        />
        <StatsCards
          title="Completed Tasks"
          value={stats.completedTasks}
          icon={CheckCircle2}
          gradient="from-orange-500 to-orange-600"
          change="+15%"
          isLoading={isLoading}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AttendanceOverview isLoading={isLoading} />
          {/* NOTE: Import path says ProjectProcess; component used here is ProjectProgress */}
          <ProjectProgress isLoading={isLoading} />
        </div>

        <div className="space-y-6">
          <RecentActivity activities={recentActivities} isLoading={isLoading} />

          <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="secondary"
                className="w-full justify-start !bg-white/10 hover:!bg-white/20 !text-white border-0"
              >
                <Clock className="w-4 h-4 mr-2" />
                Clock In/Out
              </Button>
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

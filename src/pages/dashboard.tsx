import React, { useState, useEffect } from "react";
import { Employee } from "@/entitites/employee";
import { Attendance } from "@/entitites/attendance";
import { Project } from "@/entitites/project";
import { Task } from "@/entitites/task";
// import { User } from "@/entitites/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  FolderOpen, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

import StatsCards from "../components/StatsCards";
import RecentActivity from "../components/RecentActivity";
import AttendanceOverview from "../components/AttendanceOverview";
import ProjectProgress from "../components/ProjectProcess";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    todayAttendance: 0,
    completedTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState<any>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [employees, projects, tasks, attendance] = await Promise.all([
        Employee.list(),
        Project.list(),
        Task.list(),
        Attendance.list(),
        // User.me().catch(() => null)
      ]);

      // setCurrentUser(user);

      setStats({
        totalEmployees: employees.filter(emp => emp.status === 'active').length,
        activeProjects: projects.filter(proj => proj.status === 'active').length,
        todayAttendance: attendance.filter(att => 
          att.date === format(new Date(), 'yyyy-MM-dd') && att.status === 'present'
        ).length,
        completedTasks: tasks.filter(task => task.status === 'completed').length
      });

      // Mock recent activities for demo
      setRecentActivities([
        {
          id: 1,
          type: 'attendance',
          message: 'John Smith clocked in',
          time: '2 minutes ago',
          icon: Clock,
          color: 'text-green-600'
        },
        {
          id: 2,
          type: 'task',
          message: 'Task "UI Design" completed',
          time: '15 minutes ago',
          icon: CheckCircle2,
          color: 'text-blue-600'
        },
        {
          id: 3,
          type: 'project',
          message: 'New project "Mobile App" created',
          time: '1 hour ago',
          icon: FolderOpen,
          color: 'text-purple-600'
        }
      ]);

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
    setIsLoading(false);
  };

  return (
 <div className="flex flex-col w-full max-w-full h-auto px-4 lg:px-8 py-6 overflow-hidden box-border ">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 flex flex-col items-start"
      >
        <p className="text-3xl lg:text-4xl font-bold text-slate-900">
          Welcome back, Siva
        </p>
        <p className="text-lg text-slate-600">
          Here's what's happening with your team today
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-4">
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
          change="+5%"
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
              >
                <Users className="w-4 h-4 mr-2" />
                Add New Employee
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start !bg-white/10 hover:!bg-white/20 !text-white border-0"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Run Payroll
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
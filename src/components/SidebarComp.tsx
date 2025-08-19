import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// import { createPageUrl } from "@/utils";
// import { User } from "@/entities/User";
import {
  Users,
  Clock,
  IndianRupee,
  FolderOpen,
  LayoutDashboard,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import axios, { AxiosError } from "axios";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    url: "/Employees",
    icon: Users,
  },
  {
    title: "Attendance",
    url: "/Attendance",
    icon: Clock,
  },
  {
    title: "Projects",
    url: "/Projects",
    icon: FolderOpen,
  },
  // {
  //  title: "Payroll",
  //  url: "/Payroll",
  //  icon: IndianRupee,
  // },
];

// Helper function to format time
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const pad = (num: number) => num.toString().padStart(2, "0");

  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
};

export default function SidebarComp({ children }: any) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const storedClockedIn = localStorage.getItem("isClockedIn");
    const storedClockInTime = localStorage.getItem("clockInTime");

    if (storedClockedIn === "true" && storedClockInTime) {
      const clockInDate = new Date(storedClockInTime).getTime();
      console.log(clockInDate);
      const now = Date.now();
      console.log(now);
      console.log(now - clockInDate);
      const elapsed = Math.floor((now - clockInDate) / 1000); // in seconds
      console.log(elapsed);
      setIsClockedIn(true);
      setElapsedTime(elapsed);
    }
  }, []);

  useEffect(() => {
    const checkClockInStatus = async () => {
      const today = new Date().toISOString().split("T")[0];
      const localClockedIn = localStorage.getItem("isClockedIn");
      const localClockInTime = localStorage.getItem("clockInTime");
      const localClockedInDate = localStorage.getItem("clockedInDate");

      if (
        localClockedIn === "true" &&
        localClockInTime &&
        localClockedInDate === today
      ) {
        const clockInDate = new Date(localClockInTime).getTime();
        const now = Date.now();
        const elapsed = Math.floor((now - clockInDate) / 1000);
        setIsClockedIn(true);
        setElapsedTime(elapsed);
        return;
      }

      try {
        const response = await axios.get(
          "/api/attendance/getUserAttendanceByDate",
          {
            params: {
              employeeId: user?.employee_id,
              date: today,
            },
          }
        );

        const record = response.data?.data;

        if (record && record.clockIn && !record.clockOut) {
          const clockInTime = new Date(record.clockIn).toISOString();
          const clockInDate = new Date(clockInTime).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - clockInDate) / 1000);

          localStorage.setItem("isClockedIn", "true");
          localStorage.setItem("clockInTime", clockInTime);
          localStorage.setItem("clockedInDate", today);
          localStorage.setItem("attendanceId", record._id);

          setIsClockedIn(true);
          setElapsedTime(elapsed);
        } else {
          localStorage.removeItem("isClockedIn");
          localStorage.removeItem("clockInTime");
          localStorage.removeItem("clockedInDate");
          localStorage.removeItem("attendanceId");

          setIsClockedIn(false);
          setElapsedTime(0);
        }
      } catch (error) {
        console.error("Failed to check clock-in status:", error);
      }
    };

    if (user?.employee_id) {
      checkClockInStatus();
    }
  }, [user?.employee_id]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;

    if (isClockedIn) {
      timerId = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isClockedIn]);

  const handleClockIn = async () => {
    try {
      const data = {
        employeeId: user?.employee_id,
        date: new Date().toISOString().split("T")[0],
        status: "Present",
        clockIn: new Date().toISOString(),
        clockOut: null,
        reason: "",
        createdBy: user?.userId,
      };

      const response = await axios.post(
        "/api/attendance/createAttendance",
        data
      );

      console.log("Clock-in response:", response.data);
      console.log("clockInTime:", response.data.data.clockIn);
      const clockInTime = new Date(response.data.data.clockIn).getTime();
      console.log(clockInTime);
      const now = Date.now();
      const elapsed = Math.floor((now - clockInTime) / 1000);

      // Save to localStorage
      localStorage.setItem("isClockedIn", "true");
      localStorage.setItem("clockInTime", response.data.data.clockIn);
      localStorage.setItem("attendanceId", response.data.data._id);

      setIsClockedIn(true);
      setElapsedTime(elapsed);
    } catch (error: any) {
      if (error?.status === 409) {
        alert("You have already clocked in today.");
      } else if (error.response && error.response.data) {
        console.error("Clock-in error:", error.response.data);
      }

      console.error("Clock-in error:", error);
    }
  };

  const handleClockOut = () => {
    const clockedOutTime = new Date().toISOString();
    const attendanceId = localStorage.getItem("attendanceId");
    if (!attendanceId) {
      console.error("No attendance record found for clock-out.");
      return;
    }
    axios
      .put(
        `/api/attendance/editAttendance/${attendanceId}?userId=${user?.userId}`,
        {
          clockOut: clockedOutTime,
        }
      )
      .then((response) => {
        console.log("Clock-out response:", response.data);
        localStorage.removeItem("isClockedIn");
        localStorage.removeItem("clockInTime");
        localStorage.removeItem("attendanceId");
        localStorage.removeItem("clockedInDate");

        setIsClockedIn(false);
        setElapsedTime(0);
      })
      .catch((error) => {
        console.error("Clock-out error:", error);
      });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full ">
        <style>
          {`
            :root {
              --sidebar-width: 180px;
              --primary-navy: #1e293b;
              --primary-green: #10b981;
              --text-primary: #0f172a;
              --text-secondary: #64748b;
              --border-color: #e2e8f0;
              --bg-subtle: #f8fafc;
            }
          `}
        </style>

        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Ezofis</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Employee Management
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item, index) => {
                    if (item.title === "Employees" && user?.role !== "admin") {
                      return null;
                    }

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`rounded-xl transition-all duration-200 ${
                            location.pathname === item.url ||
                            (location.pathname === "/" && index === 0)
                              ? "!bg-slate-900 !text-white shadow-lg"
                              : "hover:!bg-slate-100 !text-black hover:!text-black"
                          } `}
                        >
                          <Link
                            to={item.url}
                            className="flex items-center gap-3 px-4 py-3"
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 ">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {isClockedIn ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <div
                       
                        className="px-3 py-2 space-y-3 cursor-pointer"
                      >
                        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-800 mb-1">
                            <Clock className="w-4 h-4 text-red-600" />
                            <span>Clocked In:</span>
                          </div>
                          <p className="text-sm font-bold text-red-800">
                            {formatTime(elapsedTime)}
                          </p>
                        </div>
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure to clockout ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          By clicking confirm, you will clock out and your
                          current session will end. your total clocked in time
                          will be recorded. total hours worked :{" "}
                          {formatTime(elapsedTime)}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClockOut}
                          className="!bg-sky-600 !text-white !hover:bg-sky-700"
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <div
                    onClick={handleClockIn}
                    className="px-3 py-2 space-y-3 cursor-pointer"
                  >
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-800 mb-1">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>Quick Clock In</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Track your time instantly
                      </p>
                    </div>
                  </div>
                )}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            {
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user?.picture} />
                    <AvatarFallback className="!bg-slate-100 !text-slate-800 !font-semibold">
                      {user?.name
                        ?.split(" ")
                        .map((n: any) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {user?.name || "User Name"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || "emailId"}
                    </p>
                    <p className="text-xs font-medium text-emerald-600 capitalize">
                      {user?.role || "Role not assigned"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            }
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className=" border-slate-200 lg:hidden">
            <div className="flex">
              <SidebarTrigger className="hover:bg-slate-100 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              {/* <p className="text-xl font-bold text-slate-900">Ezofis</p> */}
            </div>
          </header>
          <div className="flex-1 overflow-auto bg-slate-50">{children}</div>
          {/* <div className="flex-1 overflow-auto bg-slate-50">
           <h1>Hello World</h1>
           </div> */}
        </main>
      </div>
    </SidebarProvider>
  );
}

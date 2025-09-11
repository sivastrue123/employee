// src/layout/SidebarComp.tsx
"use client";

import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Users,
  Clock,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  NotebookPen
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
  SidebarSeparator,
  // SidebarRail, // keep off if you don't want the vertical handle
  useSidebar, // ⬅️ new
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
import { api } from "@/lib/axios";

/* ----------------------------- Helpers ----------------------------- */

const parseWorkedTime = (s: string) => {
  const parts = s.split(" ");
  let total = 0;
  for (let i = 0; i < parts.length; i += 2) {
    const v = parseInt(parts[i]);
    const u = parts[i + 1] || "";
    if (Number.isFinite(v)) {
      if (u.startsWith("hr")) total += v * 3600;
      else if (u.startsWith("min")) total += v * 60;
      else if (u.startsWith("sec")) total += v;
    }
  }
  return total;
};

const pad = (n: number) => n.toString().padStart(2, "0");
const formatTime = (sec: number) =>
  `${pad(Math.floor(sec / 3600))}:${pad(Math.floor((sec % 3600) / 60))}:${pad(
    sec % 60
  )}`;

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles?: Array<string>;
};

const NAV_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    url: "/Dashboard",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  { title: "Employees", url: "/Employees", icon: Users, roles: ["admin"] },
  { title: "Attendance", url: "/Attendance", icon: Clock },
  { title: "Projects", url: "/Projects", icon: FolderOpen },
    { title: "Notes", url: "/AddNotes", icon: NotebookPen },
];

/* --------------------------- Component ----------------------------- */

export default function SidebarComp({
  children,
}: {
  children?: React.ReactNode;
}) {
  const { logout, user, setAttendanceRefresh, attendanceRefresh } = useAuth();
  const location = useLocation();

  // ⬇️ read collapse state from shadcn provider
  const { state } = useSidebar();
  const isCollapsed = state;

  const [isLoading] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Restore from localStorage on mount
  useEffect(() => {
    const storedClockedIn = localStorage.getItem("isClockedIn");
    const storedClockInTime = localStorage.getItem("clockInTime");
    if (storedClockedIn === "true" && storedClockInTime) {
      const elapsed = Math.floor(
        (Date.now() - new Date(storedClockInTime).getTime()) / 1000
      );
      setIsClockedIn(true);
      setElapsedTime(elapsed);
    }
  }, []);

  // Confirm status with backend per user/day
  useEffect(() => {
    const checkClockInStatus = async () => {
      const today = new Date().toISOString().split("T")[0];
      try {
        const res = await api.get("/api/attendance/getUserAttendanceByDate", {
          params: { employeeId: user?.employee_id, date: today },
        });
        const rec = res.data?.data;

        if (rec && rec.isActive) {
          if (rec?.totalWorkedTime) {
            const elapsed = Math.floor(parseWorkedTime(rec.totalWorkedTime));
            localStorage.setItem("totalWorked", rec.totalWorkedTime);
            localStorage.setItem("isClockedIn", "true");
            localStorage.setItem(
              "clockInTime",
              new Date(rec.clockIn).toISOString()
            );
            localStorage.setItem("clockedInDate", today);
            localStorage.setItem("attendanceId", rec._id);
            setIsClockedIn(true);
            setElapsedTime(elapsed);
          } else {
            const clockInTime = new Date(rec.clockIn).toISOString();
            const elapsed = Math.floor(
              (Date.now() - new Date(clockInTime).getTime()) / 1000
            );
            localStorage.setItem("isClockedIn", "true");
            localStorage.setItem("clockInTime", clockInTime);
            localStorage.setItem("clockedInDate", today);
            localStorage.setItem("attendanceId", rec._id);
            setIsClockedIn(true);
            setElapsedTime(elapsed);
          }
        } else {
          [
            "isClockedIn",
            "clockInTime",
            "clockedInDate",
            "attendanceId",
            "totalWorked",
          ].forEach((k) => localStorage.removeItem(k));
          setIsClockedIn(false);
          setElapsedTime(0);
        }
      } catch (e) {
        console.error("checkClockInStatus failed:", e);
      }
    };
    if (user?.employee_id) checkClockInStatus();
  }, [user?.employee_id]);

  // ticking timer while clocked in
  useEffect(() => {
    if (!isClockedIn) return;
    const id = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isClockedIn]);

  const handleClockIn = async () => {
    try {
      const payload = {
        employeeId: user?.employee_id,
        date: new Date().toISOString().split("T")[0],
        status: "Present",
        clockIn: new Date().toISOString(),
        clockOut: null,
        reason: "",
        createdBy: user?.userId,
      };
      const res = await api.post("/api/attendance/createAttendance", payload);
      const data = res?.data?.data;
      const clockInISO = new Date(data.clockIn).toISOString();
      const elapsed = data?.totalWorkedTime
        ? Math.floor(parseWorkedTime(data.totalWorkedTime))
        : Math.floor((Date.now() - new Date(clockInISO).getTime()) / 1000);

      localStorage.setItem("isClockedIn", "true");
      localStorage.setItem("clockInTime", clockInISO);
      localStorage.setItem("attendanceId", data._id);
      if (data?.totalWorkedTime)
        localStorage.setItem("totalWorked", data.totalWorkedTime);

      setAttendanceRefresh(!attendanceRefresh);
      setIsClockedIn(true);
      setElapsedTime(elapsed);
    } catch (error: any) {
      if (error?.status === 409) alert("You have already clocked in today.");
      console.error("Clock-in error:", error?.response?.data || error);
    }
  };

  const handleClockOut = async (isLoggedOut = false) => {
    const attendanceId = localStorage.getItem("attendanceId");
    if (!attendanceId)
      return console.error("No attendance record to clock out.");
    try {
      await api.put(
        `/api/attendance/editAttendance/${attendanceId}?userId=${user?.userId}${
          isLoggedOut ? "&LoggedOut=true" : ""
        }`,
        { clockOut: new Date().toISOString() }
      );
      [
        "isClockedIn",
        "clockInTime",
        "attendanceId",
        "clockedInDate",
        "totalWorked",
      ].forEach((k) => localStorage.removeItem(k));
      setAttendanceRefresh(!attendanceRefresh);
      setIsClockedIn(false);
      setElapsedTime(0);
    } catch (e) {
      console.error("Clock-out error:", e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r bg-white"
      aria-label="Primary navigation"
    >
      {/* Brand */}
      <SidebarHeader className="border-b px-3 py-3">
        <div
          className={`flex items-center gap-3 truncate ${
            isCollapsed == "collapsed" ? "justify-center" : ""
          }`}
        >
          {/* ✅ fixed square icon that never stretches */}
          <div className="h-8 w-8 aspect-square shrink-0 rounded-md bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          {/* Hide brand text when collapsed */}
          {isCollapsed == "expanded" && (
            <div className="min-w-0">
              <div className="truncate font-semibold">Ezofis</div>
              <div className="truncate text-xs text-muted-foreground">
                Employee Management
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Primary nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.filter(
                (n) => !n.roles || n.roles.includes(String(user?.role))
              ).map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <NavLink
                      to={item.url}
                      aria-current={
                        location.pathname === item.url ? "page" : undefined
                      }
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" aria-hidden />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Quick Actions — hidden when collapsed */}
        {isCollapsed=="expanded" && (
          <SidebarGroup>
            <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              {isClockedIn ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="cursor-pointer rounded-lg bg-red-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-red-700">
                        <Clock className="h-4 w-4" />
                        <span>Clocked In</span>
                      </div>
                      <p className="text-sm font-semibold text-red-900">
                        {formatTime(elapsedTime)}
                      </p>
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clock out now?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your session will end and the total worked time will be
                        recorded.
                        <br />
                        Elapsed: <strong>{formatTime(elapsedTime)}</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleClockOut(false)}
                        className="!bg-sky-600 !text-white hover:!bg-sky-700"
                      >
                        Break Out
                      </AlertDialogAction>
                      <AlertDialogAction
                        onClick={() => handleClockOut(true)}
                        className="!bg-red-600 !text-white hover:!bg-red-700"
                      >
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <div className="cursor-pointer rounded-lg bg-emerald-50 p-3">
                      <div className="mb-1 flex items-center gap-2 text-sm font-medium text-emerald-700">
                        <Clock className="h-4 w-4" />
                        <span>Quick Clock In</span>
                      </div>
                      <p className="text-xs text-emerald-800">
                        Track your time instantly
                      </p>
                    </div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm clock in?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleClockIn}
                        className="!bg-sky-600 !text-white hover:!bg-sky-700"
                      >
                        Confirm
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer — show only logout icon when collapsed */}
      <SidebarFooter className="border-t px-3 py-3">
        {isCollapsed=="collapsed" ? (
          <div className="flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              aria-label="Logout"
              className="text-muted-foreground hover:bg-slate-100"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.picture} />
                <AvatarFallback className="!bg-slate-100 !text-slate-800 !font-semibold">
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email || "email"}
                </p>
                <p className="text-xs font-medium text-emerald-600 capitalize">
                  {user?.role || "role"}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-muted-foreground hover:bg-slate-100"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>

      {/* If you want the draggable rail, re-enable:
      <SidebarRail /> */}
    </Sidebar>
  );
}

import React, { useState } from "react";

import { useAuth } from "@/context/AuthContext";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserTable from "./UserTable";
import EmployeeTable from "./EmployeeTable";

// -------- Types --------

const kpiCard = {
  base: "rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow p-4",
  title: "text-sm font-medium text-slate-500",
  value: "text-2xl font-semibold text-slate-900",
  sub: "text-xs text-slate-500",
} as const;

const pageSize = 10;

const Attendance: React.FC = () => {
  const { user, attendanceRefresh } = useAuth();
  const [monthlyPresents, setMonthlyPresents] = useState<number>(0);
  const [monthlyAbsents, setMonthlyAbsents] = useState<number>(0);
  const [currentViewPresent, setcurrentViewPresent] = useState<number>(0);
  const [CurrentViewAbsent, setCurrentViewAbsent] = useState<number>(0);
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16">
      <div className="mb-6">
        <p className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
          Attendance
        </p>
        <p className="mt-1 text-slate-600">
          Keep a clean view of time and presence—filter, sort, and review at a
          glance.
        </p>
      </div>

      {/* KPI row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className={kpiCard.base} aria-live="polite">
          <div className={kpiCard.title}>This Month • Present</div>
          <div className={kpiCard.value}>{monthlyPresents}</div>
          <div className={kpiCard.sub}>
            Auto-calculated for the current month
          </div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>This Month • Absent</div>
          <div className={kpiCard.value}>{monthlyAbsents}</div>
          <div className={kpiCard.sub}>
            Auto-calculated for the current month
          </div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Current View • Present</div>
          <div className={kpiCard.value}>{currentViewPresent}</div>
          <div className={kpiCard.sub}>Based on filters below</div>
        </div>
        <div className={kpiCard.base}>
          <div className={kpiCard.title}>Current View • Absent</div>
          <div className={kpiCard.value}>{CurrentViewAbsent}</div>
          <div className={kpiCard.sub}>Based on filters below</div>
        </div>
      </div>

      {user?.role === "admin" ? (
        <>
          <Tabs defaultValue="user" className="">
            <TabsList className="!border-none w-full ">
              <TabsTrigger value="user" className="tab-trigger">
                User
              </TabsTrigger>
              <TabsTrigger value="employees" className="tab-trigger">
                Employees
              </TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              <>
                <UserTable
                  pageSize={pageSize}
                  user={user}
                  attendanceRefresh={attendanceRefresh}
                  setMonthlyAbsents={setMonthlyAbsents}
                  setMonthlyPresents={setMonthlyPresents}
                  setcurrentViewPresent={setcurrentViewPresent}
                  setCurrentViewAbsent={setCurrentViewAbsent}
                />
              </>
            </TabsContent>
            <TabsContent value="employees">
              <EmployeeTable
                setMonthlyAbsents={setMonthlyAbsents}
                setMonthlyPresents={setMonthlyPresents}
                setcurrentViewPresent={setcurrentViewPresent}
                setCurrentViewAbsent={setCurrentViewAbsent}
              />
            </TabsContent>
            <style>{`
              .tab-trigger {
                transition: background-color 0.3s ease, color 0.3s ease;
              }

              .tab-trigger[data-state="active"] {
                background-color: #33cdf3ff; /* Active tab background color */
                color: white; /* Active tab text color */
              }
            `}</style>
          </Tabs>
        </>
      ) : (
        <>
          <UserTable
            pageSize={pageSize}
            user={user}
            attendanceRefresh={attendanceRefresh}
            setMonthlyAbsents={setMonthlyAbsents}
            setMonthlyPresents={setMonthlyPresents}
            setcurrentViewPresent={setcurrentViewPresent}
            setCurrentViewAbsent={setCurrentViewAbsent}
          />
        </>
      )}
    </div>
  );
};

export default Attendance;

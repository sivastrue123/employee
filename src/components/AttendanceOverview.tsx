import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, UserCheck, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttendanceOverview({ isLoading, data }: any) {
  const attendanceData = [
    {
      label: "Present",
      value: data?.todayPresent ? data?.todayPresent : 0,
      color: "bg-green-500",
      icon: UserCheck,
    },
    {
      label: "Late",
      value: data?.todayLate ? data?.todayLate : 0,
      color: "bg-yellow-500",
      icon: Clock,
    },
    {
      label: "Absent",
      value: data?.todayAbsentees ? data?.todayAbsentees : 0,
      color: "bg-red-500",
      icon: UserX,
    },
  ];

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-2" />
                  <Skeleton className="h-4 w-12 mx-auto" />
                  <Skeleton className="h-6 w-8 mx-auto mt-1" />
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-slate-700" />
          Today's Attendance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6">
          {attendanceData.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div
                className={`w-16 h-16 ${item.color} rounded-full flex items-center justify-center mx-auto mb-3`}
              >
                <item.icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-slate-900">{item.value}</p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

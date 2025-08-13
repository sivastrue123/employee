import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideProps, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  gradient: string;
  change: string;
  isLoading: boolean;
}
export default function StatsCards({ title, value, icon: Icon, gradient, change, isLoading }:StatsCardProps) {
  if (isLoading) {
    return (
      <Card className=" shadow-lg ">
        <CardContent className="p-6 ">
          <div className="flex items-center justify-between ">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
          <Skeleton className="h-4 w-20 mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
    >
      <Card className="rounded-[9px] shadow-lg  hover:shadow-xl transition-shadow duration-300 w-full ">
        <CardContent className="">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <p className="text-3xl font-bold text-slate-900">{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          {change && (
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-green-600 font-medium">{change}</span>
              <span className="text-slate-500 ml-1">from last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
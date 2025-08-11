import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectProgress({ isLoading }) {
  const projects = [
    { name: "Website Redesign", progress: 85, status: "active", color: "bg-blue-500" },
    { name: "Mobile App", progress: 60, status: "active", color: "bg-purple-500" },
    { name: "Marketing Campaign", progress: 35, status: "planning", color: "bg-orange-500" },
  ];

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-slate-700" />
          Project Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 ${project.color} rounded-full`}></div>
                  <h3 className="font-medium text-slate-900">{project.name}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {project.progress}%
                </Badge>
              </div>
              <Progress value={project.progress} className="h-2" />
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
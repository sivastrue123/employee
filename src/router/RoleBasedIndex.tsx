// src/components/RoleBasedIndex.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RoleBasedIndex() {
  const { user } = useAuth();
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  return <Navigate to={isAdmin ? "/Dashboard" : "/Attendance"} replace />;
}

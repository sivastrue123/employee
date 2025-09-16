import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Projects from "@/pages/project/Projects";
import Attendance from "@/pages/attendance/Attendance";
import Payroll from "@/pages/Payroll";
import AddNotes from "@/pages/addnotes/AddNotes";
import RoleBasedIndex from "./RoleBasedIndex";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <h1>oops! An error occurred</h1>,
    children: [
      {
        index: true,
        element: <RoleBasedIndex />,
      },
      {
        path: "/Dashboard",
        element: <Dashboard />,
      },
      { path: "/Employees", element: <Employees /> },
      { path: "/Projects", element: <Projects /> },
      { path: "/Payroll", element: <Payroll /> },
      { path: "/Attendance", element: <Attendance /> },
      { path: "/AddNotes", element: <AddNotes /> },
    ],
  },
]);

export default router;

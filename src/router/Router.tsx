import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import Projects from "@/pages/project/Projects";
import Attendance from "@/pages/attendance/Attendance";
import Payroll from "@/pages/Payroll";
import AddNotes from "@/pages/addnotes/AddNotes";
import RoleBasedIndex from "./RoleBasedIndex";
import Worklogs from "@/pages/worklog/Worklogs";

import { DeviceGate } from "../components/DeviceGate";
import { NotSupported } from "../components/NotSupported";
import { JSX } from "react";

const withGate = (element: JSX.Element) => <DeviceGate>{element}</DeviceGate>;

const router = createBrowserRouter([
  {
    path: "/",
    element: withGate(<Layout />),
    errorElement: <h1>oops! An error occurred</h1>,
    children: [
      {
        index: true,
        element: withGate(<RoleBasedIndex />),
      },
      {
        path: "/Dashboard",
        element: withGate(<Dashboard />),
      },
      { path: "/Employees", element: withGate(<Employees />) },
      { path: "/Projects", element: withGate(<Projects />) },
      { path: "/Payroll", element: withGate(<Payroll />) },
      { path: "/Attendance", element: withGate(<Attendance />) },
      { path: "/AddNotes", element: withGate(<AddNotes />) },
      { path: "/Worklog", element: withGate(<Worklogs />) },
      { path: "/not-supported", element: <NotSupported /> },
      { path: "*", element: withGate(<RoleBasedIndex />) },
    ],
  },
]);

export default router;

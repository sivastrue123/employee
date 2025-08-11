import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import Dashboard from "@/pages/dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <h1>oops! An error occurred</h1>,
    children: [
      {
        index: true,
        element: <Dashboard/>,
      },
    ],
  },
]);

export default router;
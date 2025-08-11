import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <h1>oops! An error occurred</h1>,
    children: [
      {
        index: true,
        element: <h2>Hello world</h2>,
      },
    ],
  },
]);

export default router;


import './App.css'

import router from "./router/Router.js";
import { RouterProvider } from "react-router-dom";

export default function App() {
  return <RouterProvider router={router} />;
}


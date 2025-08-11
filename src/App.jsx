import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import router from "./router/Router";
import { RouterProvider } from "react-router-dom";

export default function App() {
  return <RouterProvider router={router} />;
}


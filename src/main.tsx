// import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import React from "react";
import { ToastProvider } from "./toast/ToastProvider";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider
        maxVisible={3}
        defaultDurationMs={5000}
        defaultPosition="top-right"
      >
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);

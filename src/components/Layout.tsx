// src/layout/Layout.tsx
import * as React from "react";
import { Outlet } from "react-router-dom";
import SidebarComp from "./SidebarComp";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const Layout: React.FC = () => {
  return (
    <SidebarProvider>
      <SidebarComp />

      {/* Main content that auto-resizes with the sidebar state */}
      <SidebarInset>
        {/* Top App Bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4">
          <SidebarTrigger aria-label="Toggle navigation" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Ezofis</span>
            <span>•</span>
            <span>Employee Management</span>
          </div>
          <div className="ml-auto" />
        </header>

        <main className="min-h-[calc(100dvh-3.5rem)] p-4">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>

        <footer className="border-t px-4 py-3 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Ezofis. All rights reserved.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;

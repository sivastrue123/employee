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
      {/* ⬇️ This wrapper is the missing piece */}
      <div className="flex min-h-screen w-full">
        <SidebarComp />

        <SidebarInset className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4">
            <SidebarTrigger aria-label="Toggle navigation" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Ezofis</span>
              <span>•</span>
              <span>Employee Management</span>
            </div>
            <div className="ml-auto" />
          </header>

          {/* No width clamps here */}
          <main className="min-h-[calc(100dvh-3.5rem)] px-4 lg:px-6">
            <div className="w-full min-w-0">
              <Outlet />
            </div>
          </main>

          <footer className="border-t px-4 py-3 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ezofis. All rights reserved.
          </footer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;

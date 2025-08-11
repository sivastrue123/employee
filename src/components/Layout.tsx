import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarComp from "./SidebarComp";

const Layout = () => {
  
  return (
    <div className={`flex w-screen h-screen bg-slate-50`}>
      <div className="" >
        <SidebarComp  />
      </div>
      <div className="w-[100%] h-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
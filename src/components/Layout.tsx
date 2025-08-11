import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarComp from "./SidebarComp";

const Layout = () => {
  
  return (
    <div className={`flex  `}>
      <div className="flex w-[20%]">
        <SidebarComp  />
      </div>
      <div className={`flex-1 `}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
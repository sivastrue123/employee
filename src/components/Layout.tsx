import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SidebarComp from "./SidebarComp";

const Layout = () => {
  
  return (
    <div className={`flex`}>
      <div className="">
        <SidebarComp  />
      </div>
      <div className={`absolute`}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
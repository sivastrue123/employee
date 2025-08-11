import React from "react";
import { Link, useLocation } from "react-router-dom";
// import { createPageUrl } from "@/utils";
// import { User } from "@/entities/User";
import { 
  Users, 
  Clock, 
  DollarSign, 
  FolderOpen, 
  LayoutDashboard, 
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/Dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    url: "/Employees",
    icon: Users,
  },
  {
    title: "Attendance",
    url: "/Attendance",
    icon: Clock,
  },
  {
    title: "Projects",
    url: "/Projects",
    icon: FolderOpen,
  },
  {
    title: "Payroll",
    url: "/Payroll",
    icon: DollarSign,
  },
];

export default function SidebarC() {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // const loadUser = async () => {
    //   try {
    //     const currentUser = await User.me();
    //     setUser(currentUser);
    //   } catch (error) {
    //     console.log("User not authenticated");
    //   }
    //   setIsLoading(false);
    // };
    // loadUser();
  }, []);

  const handleLogout = async () => {
    // await User.logout();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
      
        <style>
          {`
            :root {
              --sidebar-width: 280px;
              --primary-navy: #1e293b;
              --primary-green: #10b981;
              --text-primary: #0f172a;
              --text-secondary: #64748b;
              --border-color: #e2e8f0;
              --bg-subtle: #f8fafc;
            }
          `}
        </style>
        
        <Sidebar className="border-r border-slate-200 bg-white">
          <SidebarHeader className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-600 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">WorkFlow</h2>
                <p className="text-xs text-slate-500 font-medium">Employee Management</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`rounded-xl transition-all duration-200 ${
                          location.pathname === item.url 
                            ? 'bg-slate-900 text-white shadow-lg' 
                            : 'hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                Quick Actions
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-800 mb-1">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Quick Clock In</span>
                    </div>
                    <p className="text-xs text-slate-600">Track your time instantly</p>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200 p-4">
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={""} />
                    <AvatarFallback className="bg-slate-100 text-slate-800 font-semibold">
                      {/* {user.full_name?.split(' ').map(n => n[0]).join('') || 'U'} */}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      { 'User'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{"mail id"}</p>
                    <p className="text-xs font-medium text-emerald-600 capitalize">{"role"}</p>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="icon"
                  onClick={handleLogout}
                  className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4 lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              <h1 className="text-xl font-bold text-slate-900">WorkFlow</h1>
            </div>
          </header>

          {/* <div className="flex-1 overflow-auto bg-slate-50">
           <h1>Hello World</h1>
          </div> */}
        </main>
      </div>
    </SidebarProvider>
  );
}
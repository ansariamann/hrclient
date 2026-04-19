import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  UserCheck,
  Briefcase,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Candidates", url: "/candidates", icon: Users },
  { title: "Interviews", url: "/interviews", icon: CalendarCheck },
  { title: "Selected", url: "/selected", icon: UserCheck },
  { title: "Job Requests", url: "/new-job", icon: Briefcase },
  { title: "My Company", url: "/my-company", icon: Building2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { logout, clientName } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-card">
      <SidebarHeader className="p-4 pb-5">
        <div className="flex items-center gap-3">
          {/* Gradient brand icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm">
            <Users className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="text-sm font-bold text-foreground tracking-tight">Client Portal</span>
              {clientName && (
                <p className="text-[11px] text-muted-foreground truncate max-w-[120px] mt-0.5">{clientName}</p>
              )}
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-0.5">
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                    className={`rounded-xl h-10 transition-all duration-200 ${
                      isActive(item.url)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName=""
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 pb-4">
        <SidebarMenu className="space-y-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/settings")}
              tooltip="Settings"
              className={`rounded-xl h-10 transition-all duration-200 ${
                isActive("/settings")
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <NavLink to="/settings" className="flex items-center gap-3" activeClassName="">
                <Settings className="h-4 w-4 shrink-0" />
                <span className="text-sm font-medium">Settings</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={logout}
              className="rounded-xl h-10 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  BarChart3,
  GraduationCap,
  Award,
  Settings,
  Compass,
  Shield,
  ChevronRight,
  ChevronLeft,
  Home,
  Users,
  Activity,
  Package,
  HelpCircle,
  Menu,
  LogOut,
  Tag,
  Percent,
  Wallet,
} from "lucide-react";
import { Link, useLocation } from "wouter";
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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { logout as apiLogout } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const studentItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Explore",
    url: "/explore",
    icon: Compass,
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookOpen,
  },
  {
    title: "Schedule",
    url: "/schedule",
    icon: Calendar,
  },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Class",
    url: "/class",
    icon: GraduationCap,
  },
  {
    title: "Certificate",
    url: "/certificate",
    icon: Award,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

const adminItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Course Management",
    url: "/admin/courses",
    icon: BookOpen,
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: GraduationCap,
  },
  {
    title: "Admin Management",
    url: "/admin/admins",
    icon: Shield,
  },
  {
    title: "Agent Management",
    url: "/admin/agents",
    icon: Users,
  },
  {
    title: "Coupons",
    url: "/admin/coupons",
    icon: Tag,
  },
  {
    title: "Subscription Plans",
    url: "/admin/subscription-plans",
    icon: Package,
  },
  {
    title: "Commission Plans",
    url: "/admin/commission-plans",
    icon: Percent,
  },
  {
    title: "Wallets",
    url: "/admin/wallets",
    icon: Wallet,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AppSidebar({ isAdmin = false }: { isAdmin?: boolean }) {
  const [location, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user, logout: authLogout } = useAuth();
  const { toast } = useToast();
  const items = isAdmin ? adminItems : studentItems;

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "user@example.com";
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiLogout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      authLogout();
      setShowLogoutDialog(false);
      setLocation("/signin");
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Failed to logout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative flex h-screen">
      {/* Sidebar - Collapsible */}
      <div className={cn(
        "bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 shadow-xl transition-all duration-300 relative z-50",
        isExpanded ? "w-64" : "w-16"
      )}>
        {/* Toggle Button */}
        <div className="mb-6 w-full px-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "relative w-full h-11 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden group",
              isExpanded 
                ? "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-500 hover:via-blue-600 hover:to-indigo-600 shadow-lg shadow-blue-900/50" 
                : "bg-slate-800/70 hover:bg-gradient-to-br hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg hover:shadow-blue-900/30"
            )}
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
            
            {/* Icon with rotation animation */}
            <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-200">
              {isExpanded ? (
                <ChevronLeft className="h-5 w-5 text-white drop-shadow-md" />
              ) : (
                <Menu className="h-5 w-5 text-slate-300 group-hover:text-white drop-shadow-md" />
              )}
            </div>
            
            {/* Glow effect on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-xl transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Logo and Header */}
        {isExpanded ? (
          <div className="mb-6 px-3 w-full">
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm truncate">Adhyanguru</h3>
                <p className="text-slate-400 text-xs truncate">{displayEmail}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mx-auto">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 w-full px-3 overflow-y-auto">
          <div className="space-y-1">
            {items.map((item) => {
              const isActive = location === item.url;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-lg transition-all duration-200 relative group",
                    isExpanded ? "px-3 py-2.5" : "w-10 h-10 justify-center mx-auto",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                      : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  
                  {isExpanded && (
                    <span className="text-sm font-medium flex-1">{item.title}</span>
                  )}

                  {isExpanded && isActive && (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  
                  {/* Active Indicator */}
                  {isActive && !isExpanded && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-400 rounded-r-full"></div>
                  )}

                  {/* Tooltip when collapsed */}
                  {!isExpanded && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                      {item.title}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Access - Only when expanded */}
          {isExpanded && (
            <div className="mt-6">
              <h4 className="text-slate-500 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
                Quick Access
              </h4>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Customers</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200">
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200">
                  <Package className="h-4 w-4" />
                  <span className="text-sm">Integrations</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Bottom Section */}
        <div className={cn("mt-auto px-3 space-y-2", isExpanded ? "w-full" : "")}>
          {/* Help Button */}
          {isExpanded ? (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold">Help & Support</p>
                  <p className="text-slate-400 text-xs">Get assistance</p>
                </div>
              </div>
            </div>
          ) : (
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 mx-auto">
              <HelpCircle className="h-5 w-5" />
            </button>
          )}

          {/* Activity Button */}
          {!isExpanded && (
            <button className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 mx-auto">
              <Activity className="h-5 w-5" />
            </button>
          )}

          {/* User Profile */}
          {isExpanded ? (
            <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 rounded-lg border border-slate-700 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold rounded-lg text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">{displayName}</p>
                  <p className="text-slate-400 text-xs truncate">{displayEmail}</p>
                </div>
              </div>
            </div>
          ) : (
            <Avatar className="h-10 w-10 rounded-xl border-2 border-slate-700 cursor-pointer hover:border-blue-500 transition-colors mx-auto">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold rounded-xl text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Logout Button */}
          {isExpanded ? (
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="mt-3 w-full p-3 bg-red-600/10 hover:bg-red-600/20 rounded-lg border border-red-600/30 hover:border-red-600/50 transition-all duration-200 flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                <LogOut className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-red-400 group-hover:text-red-300 text-xs font-semibold">Logout</p>
                <p className="text-red-500/70 text-xs">Sign out of account</p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setShowLogoutDialog(true)}
              className="mt-3 w-10 h-10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-600/20 hover:text-red-300 transition-all duration-200 mx-auto border border-red-600/30 hover:border-red-600/50"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-red-100">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <AlertDialogTitle className="text-xl">Confirm Logout</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              Are you sure you want to logout? You will need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoggingOut}
              className="h-11 px-6"
            >
              No, Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Yes, Logout
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

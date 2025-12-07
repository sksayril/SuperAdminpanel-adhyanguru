import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { AuthProvider, ProtectedRoute, useAuth } from "@/contexts/AuthContext";
import { RootRedirect } from "@/components/RootRedirect";
import NotFound from "@/pages/not-found";
import Signup from "@/pages/signup";
import Signin from "@/pages/signin";
import Dashboard from "@/pages/dashboard";
import Explore from "@/pages/explore";
import Courses from "@/pages/courses";
import SchedulePage from "@/pages/schedule";
import Analytics from "@/pages/analytics";
import Class from "@/pages/class";
import Certificate from "@/pages/certificate";
import Settings from "@/pages/settings";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCourses from "@/pages/admin/courses";
import AdminUsers from "@/pages/admin/users";
import AdminManagement from "@/pages/admin/admins";
import AgentManagement from "@/pages/admin/agents";
import CouponsManagement from "@/pages/admin/coupons";
import SubscriptionPlansManagement from "@/pages/admin/subscription-plans";
import CommissionPlansManagement from "@/pages/admin/commission-plans";
import WalletManagement from "@/pages/admin/wallets";

// Public Layout (for auth pages)
function PublicLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Private Layout (for authenticated pages)
function PrivateLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");

  return (
    <div className="flex h-screen w-full bg-slate-50">
      <AppSidebar isAdmin={isAdmin} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Redirect component for authenticated users trying to access auth pages
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      // Use setTimeout to ensure this runs after render
      const timer = setTimeout(() => {
        setLocation("/admin");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function Router() {

  return (
    <Switch>
      {/* Auth Routes - Public */}
      <Route path="/signup">
        <AuthRedirect>
          <PublicLayout>
            <Signup />
          </PublicLayout>
        </AuthRedirect>
      </Route>
      <Route path="/signin">
        <AuthRedirect>
          <PublicLayout>
            <Signin />
          </PublicLayout>
        </AuthRedirect>
      </Route>

      {/* Root redirect - redirect to admin if authenticated, otherwise to signin */}
      <Route path="/">
        <RootRedirect />
      </Route>

      {/* Protected Routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <PrivateLayout>
            <Dashboard />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/explore">
        <ProtectedRoute>
          <PrivateLayout>
            <Explore />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/courses">
        <ProtectedRoute>
          <PrivateLayout>
            <Courses />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/schedule">
        <ProtectedRoute>
          <PrivateLayout>
            <SchedulePage />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <PrivateLayout>
            <Analytics />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/class">
        <ProtectedRoute>
          <PrivateLayout>
            <Class />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/certificate">
        <ProtectedRoute>
          <PrivateLayout>
            <Certificate />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <PrivateLayout>
            <Settings />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>

      {/* Admin Routes - Protected */}
      <Route path="/admin">
        <ProtectedRoute>
          <PrivateLayout>
            <AdminDashboard />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/courses">
        <ProtectedRoute>
          <PrivateLayout>
            <AdminCourses />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute>
          <PrivateLayout>
            <AdminUsers />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/admins">
        <ProtectedRoute>
          <PrivateLayout>
            <AdminManagement />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/agents">
        <ProtectedRoute>
          <PrivateLayout>
            <AgentManagement />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/coupons">
        <ProtectedRoute>
          <PrivateLayout>
            <CouponsManagement />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/subscription-plans">
        <ProtectedRoute>
          <PrivateLayout>
            <SubscriptionPlansManagement />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/commission-plans">
        <ProtectedRoute>
          <PrivateLayout>
            <CommissionPlansManagement />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/wallets">
        <ProtectedRoute>
          <PrivateLayout>
            <WalletManagement />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute>
          <PrivateLayout>
            <Analytics />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute>
          <PrivateLayout>
            <Settings />
          </PrivateLayout>
        </ProtectedRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

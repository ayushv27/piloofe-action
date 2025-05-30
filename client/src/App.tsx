import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";
import { NotificationToast } from "@/components/notification-toast";

// Pages
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import LiveFeed from "@/pages/live-feed";
import EventAlerts from "@/pages/alerts";
import EmployeeMonitoring from "@/pages/employees";
import ZoneSetup from "@/pages/zone-setup";
import AdminSettings from "@/pages/admin";
import ReportsAnalytics from "@/pages/reports";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <MainLayout>{children}</MainLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/live-feed">
        <ProtectedRoute>
          <LiveFeed />
        </ProtectedRoute>
      </Route>
      <Route path="/alerts">
        <ProtectedRoute>
          <EventAlerts />
        </ProtectedRoute>
      </Route>
      <Route path="/employees">
        <ProtectedRoute>
          <EmployeeMonitoring />
        </ProtectedRoute>
      </Route>
      <Route path="/zone-setup">
        <ProtectedRoute>
          <ZoneSetup />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute>
          <AdminSettings />
        </ProtectedRoute>
      </Route>
      <Route path="/reports">
        <ProtectedRoute>
          <ReportsAnalytics />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NotificationToast />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

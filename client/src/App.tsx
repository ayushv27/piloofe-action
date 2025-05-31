import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";
import { MainLayout } from "@/components/layout/main-layout";
import { NotificationToast } from "@/components/notification-toast";

// Pages
import Landing from "@/pages/landing";
import Signup from "@/pages/signup";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import AIChat from "@/pages/ai-chat";
import LiveFeed from "@/pages/live-feed";
import Recordings from "@/pages/recordings";
import EventAlerts from "@/pages/alerts";
import EmployeeMonitoring from "@/pages/employees";
import ZoneSetup from "@/pages/zone-setup";
import AdminSettings from "@/pages/admin";
import ReportsAnalytics from "@/pages/reports";
import Search from "@/pages/search";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <MainLayout>{children}</MainLayout>;
}

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/signup" component={Signup} />
      <Route path="/login" component={Login} />
      <Route path="/">
        {isAuthenticated ? (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ) : (
          <Landing />
        )}
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/ai-chat">
        <ProtectedRoute>
          <AIChat />
        </ProtectedRoute>
      </Route>
      <Route path="/live-feed">
        <ProtectedRoute>
          <LiveFeed />
        </ProtectedRoute>
      </Route>
      <Route path="/recordings">
        <ProtectedRoute>
          <Recordings />
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
      <Route path="/search">
        <ProtectedRoute>
          <Search />
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
      <Route path="/terms">
        <ProtectedRoute>
          <Terms />
        </ProtectedRoute>
      </Route>
      <Route path="/privacy">
        <ProtectedRoute>
          <Privacy />
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

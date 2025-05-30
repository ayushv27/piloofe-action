import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Video, AlertTriangle, Bell, Map, TrendingUp, TrendingDown } from "lucide-react";

interface DashboardStats {
  activeCameras: number;
  todayIncidents: number;
  currentAlerts: number;
  zoneCoverage: string;
  employeeStats: {
    present: number;
    absent: number;
    late: number;
    avgDuration: string;
  };
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Security Dashboard</h1>
          <p className="text-neutral-600">Real-time monitoring and analytics overview</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-neutral-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Ghoobad.ai Dashboard</h1>
        <p className="text-neutral-600">AI-powered surveillance monitoring and analytics</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Active Cameras</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.activeCameras || 0}</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <Video className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success text-sm font-medium">Online</span>
              <span className="text-neutral-500 text-sm ml-1">and monitoring</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Today's Incidents</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.todayIncidents || 0}</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-warning mr-1" />
              <span className="text-warning text-sm font-medium">Tracking</span>
              <span className="text-neutral-500 text-sm ml-1">security events</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Current Alerts</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.currentAlerts || 0}</p>
              </div>
              <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
                <Bell className="h-6 w-6 text-danger" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingDown className="h-4 w-4 text-success mr-1" />
              <span className="text-success text-sm font-medium">Managed</span>
              <span className="text-neutral-500 text-sm ml-1">effectively</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Zone Coverage</p>
                <p className="text-2xl font-bold text-neutral-900">{stats?.zoneCoverage || "0%"}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Map className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-success mr-1" />
              <span className="text-success text-sm font-medium">Optimal</span>
              <span className="text-neutral-500 text-sm ml-1">coverage</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts and Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Trends Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Entry Trends (24h)</h3>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">Line Chart Placeholder</p>
                <p className="text-sm text-neutral-400">Hourly entry/exit data</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Zone Heatmap */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Zone Activity Heatmap</h3>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Map className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">Heatmap Placeholder</p>
                <p className="text-sm text-neutral-400">Zone activity intensity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, AlertTriangle, Bell, Map, TrendingUp, TrendingDown, Play, Trophy } from "lucide-react";
import { OnboardingTutorial } from "@/components/onboarding-tutorial";

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
  const [showTutorial, setShowTutorial] = useState(false);
  
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
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Piloo.ai Dashboard</h1>
            <p className="text-blue-100 text-lg">AI-powered surveillance monitoring and analytics</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowTutorial(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Tutorial
            </Button>
            <Button
              onClick={() => window.location.href = '/onboarding'}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Trophy className="h-4 w-4 mr-2" />
              View Progress
            </Button>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{new Date().toLocaleDateString()}</div>
            <div className="text-blue-100">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Cameras</p>
                <p className="text-3xl font-bold text-slate-900 group-hover:text-green-600 transition-colors">{stats?.activeCameras || 0}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl group-hover:from-green-200 group-hover:to-green-300 transition-all">
                <Video className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 text-sm font-medium">98.5% uptime</span>
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

      {/* Onboarding Tutorial Modal */}
      <OnboardingTutorial 
        isOpen={showTutorial}
        onComplete={() => setShowTutorial(false)}
        onSkip={() => setShowTutorial(false)}
      />
    </div>
  );
}

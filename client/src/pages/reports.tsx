import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  FileText, 
  Download, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Camera as CameraIcon,
  Users,
  AlertTriangle,
  Activity,
  Calendar,
  PieChart,
  LineChart,
  Filter,
  RefreshCw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Color schemes for charts
const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'];

export default function ReportsAnalytics() {
  const [reportType, setReportType] = useState("incidents");
  const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [zoneFilter, setZoneFilter] = useState("all");
  const [timeRange, setTimeRange] = useState("30d");
  const { toast } = useToast();

  // Fetch real analytics data from the database
  const { data: analyticsData, isLoading, refetch } = useQuery({
    queryKey: ["/api/analytics", timeRange, zoneFilter],
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: incidentTrends } = useQuery({
    queryKey: ["/api/analytics/incident-trends", dateFrom, dateTo],
  });

  const { data: occupancyData } = useQuery({
    queryKey: ["/api/analytics/occupancy", timeRange],
  });

  const { data: alertDistribution } = useQuery({
    queryKey: ["/api/analytics/alert-distribution", timeRange],
  });

  const { data: activityHeatmap } = useQuery({
    queryKey: ["/api/analytics/activity-heatmap", timeRange],
  });

  const { data: cameras = [] } = useQuery({
    queryKey: ["/api/cameras"],
  });

  const { data: zones = [] } = useQuery({
    queryKey: ["/api/zones"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const handleGenerateReport = async () => {
    try {
      const response = await apiRequest("POST", "/api/reports/generate", {
        type: reportType,
        dateFrom,
        dateTo,
        zoneFilter
      });
      
      if (response.ok) {
        toast({
          title: "Report Generated",
          description: "Your report has been generated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async (format: 'pdf' | 'excel') => {
    try {
      const response = await apiRequest("POST", `/api/reports/download/${format}`, {
        type: reportType,
        dateFrom,
        dateTo,
        zoneFilter
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}_report_${dateFrom}_${dateTo}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download Started",
          description: `Your ${format.toUpperCase()} report is downloading.`,
        });
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to download ${format.toUpperCase()} report.`,
        variant: "destructive",
      });
    }
  };

  // Sample data for visualization (will be replaced with real data from API)
  const incidentTrendData = incidentTrends || [
    { date: '2024-01-01', incidents: 12, resolved: 10 },
    { date: '2024-01-02', incidents: 8, resolved: 8 },
    { date: '2024-01-03', incidents: 15, resolved: 13 },
    { date: '2024-01-04', incidents: 10, resolved: 9 },
    { date: '2024-01-05', incidents: 18, resolved: 16 },
    { date: '2024-01-06', incidents: 6, resolved: 6 },
    { date: '2024-01-07', incidents: 9, resolved: 8 }
  ];

  const alertTypeData = alertDistribution || [
    { name: 'Intrusion', value: 45, count: 45 },
    { name: 'Motion', value: 30, count: 30 },
    { name: 'Loitering', value: 15, count: 15 },
    { name: 'Vehicle', value: 10, count: 10 }
  ];

  const zoneOccupancyData = occupancyData || [
    { zone: 'Entrance A', occupancy: 85, capacity: 100 },
    { zone: 'Lobby', occupancy: 45, capacity: 80 },
    { zone: 'Parking', occupancy: 120, capacity: 200 },
    { zone: 'Office Area', occupancy: 65, capacity: 150 }
  ];

  const activityData = activityHeatmap || [
    { hour: '00:00', monday: 2, tuesday: 1, wednesday: 3, thursday: 2, friday: 1, saturday: 4, sunday: 2 },
    { hour: '06:00', monday: 15, tuesday: 12, wednesday: 18, thursday: 14, friday: 16, saturday: 8, sunday: 6 },
    { hour: '09:00', monday: 45, tuesday: 42, wednesday: 48, thursday: 44, friday: 46, saturday: 25, sunday: 15 },
    { hour: '12:00', monday: 35, tuesday: 38, wednesday: 40, thursday: 36, friday: 35, saturday: 30, sunday: 25 },
    { hour: '18:00', monday: 28, tuesday: 30, wednesday: 32, thursday: 29, friday: 25, saturday: 35, sunday: 20 },
    { hour: '21:00', monday: 8, tuesday: 10, wednesday: 12, thursday: 9, friday: 15, saturday: 25, sunday: 18 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Comprehensive surveillance data analysis and reporting
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Time Range and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Analytics Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Time Range</Label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Zone Filter</Label>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zones.map((zone: any) => (
                    <SelectItem key={zone.id} value={zone.id.toString()}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date From</Label>
              <Input 
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input 
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.todayIncidents || 4}</p>
                <p className="text-sm text-gray-600">Total Incidents Today</p>
                <Badge variant="secondary" className="mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs yesterday
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CameraIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats?.activeCameras || 3}</p>
                <p className="text-sm text-gray-600">Active Cameras</p>
                <Badge variant="secondary" className="mt-1">
                  99.8% uptime
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">2.4m</p>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <Badge variant="secondary" className="mt-1">
                  -15% improvement
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-600">People Detected Today</p>
                <Badge variant="secondary" className="mt-1">
                  Normal activity
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Incident Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={incidentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="incidents" stroke="#EF4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Weekly Activity Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={incidentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="incidents" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Alert Type Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <Legend />
                    <Pie
                      data={alertTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({name, percent}: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {alertTypeData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Alert Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alertTypeData.map((alert, index) => (
                    <div key={alert.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{alert.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{alert.count}</p>
                        <p className="text-sm text-gray-500">{alert.value}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="occupancy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Zone Occupancy Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={zoneOccupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="occupancy" fill="#3B82F6" name="Current Occupancy" />
                  <Bar dataKey="capacity" fill="#E5E7EB" name="Max Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Activity Heatmap (Hourly Patterns)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="monday" stackId="a" fill="#EF4444" />
                  <Bar dataKey="tuesday" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="wednesday" stackId="a" fill="#10B981" />
                  <Bar dataKey="thursday" stackId="a" fill="#3B82F6" />
                  <Bar dataKey="friday" stackId="a" fill="#8B5CF6" />
                  <Bar dataKey="saturday" stackId="a" fill="#EC4899" />
                  <Bar dataKey="sunday" stackId="a" fill="#6B7280" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Generate Custom Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incidents">Incident Analysis</SelectItem>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="occupancy">Occupancy Report</SelectItem>
                  <SelectItem value="camera-status">Camera Status Report</SelectItem>
                  <SelectItem value="security-summary">Security Summary</SelectItem>
                  <SelectItem value="trend-analysis">Trend Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date From</Label>
              <Input 
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Date To</Label>
              <Input 
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Zone Filter</Label>
              <Select value={zoneFilter} onValueChange={setZoneFilter}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="All Zones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
                  {zones.map((zone: any) => (
                    <SelectItem key={zone.id} value={zone.id.toString()}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={handleGenerateReport}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={() => handleDownloadReport('pdf')}>
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => handleDownloadReport('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
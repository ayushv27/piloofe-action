import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, FileText, Download, TrendingUp, Clock, CheckCircle, Camera as CameraIcon } from "lucide-react";

export default function ReportsAnalytics() {
  const [reportType, setReportType] = useState("incidents");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [zoneFilter, setZoneFilter] = useState("");

  const handleGenerateReport = () => {
    console.log("Generating report:", { reportType, dateFrom, dateTo, zoneFilter });
  };

  const handleDownloadPDF = () => {
    console.log("Downloading PDF report");
  };

  const handleDownloadExcel = () => {
    console.log("Downloading Excel report");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Reports & Analytics</h1>
        <p className="text-neutral-600">Generate reports and view analytics data</p>
      </div>
      
      {/* Report Generation */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Generate Reports</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incidents">Incident Report</SelectItem>
                  <SelectItem value="attendance">Attendance Report</SelectItem>
                  <SelectItem value="occupancy">Occupancy Report</SelectItem>
                  <SelectItem value="camera-status">Camera Status Report</SelectItem>
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
                  <SelectItem value="">All Zones</SelectItem>
                  <SelectItem value="entrance-a">Entrance A</SelectItem>
                  <SelectItem value="lobby">Lobby</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="office">Office Areas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={handleGenerateReport}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handleDownloadExcel}>
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Incident Trends */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Incident Trends (Last 30 Days)</h3>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">Line Chart Placeholder</p>
                <p className="text-sm text-neutral-400">Daily incident trends</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Occupancy by Zone */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Average Occupancy by Zone</h3>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">Bar Chart Placeholder</p>
                <p className="text-sm text-neutral-400">Zone occupancy data</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Time Analysis */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Peak Activity Hours</h3>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">Heatmap Placeholder</p>
                <p className="text-sm text-neutral-400">Hourly activity patterns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Alert Distribution */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Alert Distribution by Type</h3>
            <div className="h-64 bg-neutral-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
                <p className="text-neutral-500">Pie Chart Placeholder</p>
                <p className="text-sm text-neutral-400">Alert type breakdown</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">156</p>
            <p className="text-sm text-neutral-600">Total Incidents (30 days)</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">142</p>
            <p className="text-sm text-neutral-600">Resolved Incidents</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">4.2m</p>
            <p className="text-sm text-neutral-600">Avg Response Time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CameraIcon className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">99.8%</p>
            <p className="text-sm text-neutral-600">Camera Uptime</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

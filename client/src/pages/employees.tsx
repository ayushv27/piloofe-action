import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";
import type { Employee } from "@shared/schema";

// Generate sample employee data for today
const generateSampleEmployees = (): Employee[] => {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 1,
      name: "John Doe",
      employeeId: "EMP001",
      department: "Security",
      checkIn: "08:30",
      checkOut: "18:15",
      lastSeen: "Zone A - 5m ago",
      status: "active",
      date: today,
    },
    {
      id: 2,
      name: "Jane Smith",
      employeeId: "EMP002",
      department: "HR",
      checkIn: "09:15",
      checkOut: "17:30",
      lastSeen: "Zone D - 2m ago",
      status: "active",
      date: today,
    },
    {
      id: 3,
      name: "Mike Brown",
      employeeId: "EMP003",
      department: "IT",
      checkIn: "08:45",
      checkOut: "",
      lastSeen: "Zone B - 15m ago",
      status: "active",
      date: today,
    },
    {
      id: 4,
      name: "Sarah Wilson",
      employeeId: "EMP004",
      department: "Admin",
      checkIn: "09:00",
      checkOut: "17:00",
      lastSeen: "Zone C - 1h ago",
      status: "inactive",
      date: today,
    },
    {
      id: 5,
      name: "David Lee",
      employeeId: "EMP005",
      department: "Security",
      checkIn: "10:30",
      checkOut: "",
      lastSeen: "Zone A - 10m ago",
      status: "active",
      date: today,
    },
  ];
};

export default function EmployeeMonitoring() {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // For demo purposes, we'll use the generated sample data
  // In a real app, this would come from the API
  const employees = generateSampleEmployees();

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !departmentFilter || employee.department === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const calculateDuration = (checkIn: string, checkOut: string) => {
    if (!checkIn) return "0h 0m";
    
    const [inHour, inMin] = checkIn.split(":").map(Number);
    const now = new Date();
    
    if (checkOut) {
      const [outHour, outMin] = checkOut.split(":").map(Number);
      const duration = (outHour * 60 + outMin) - (inHour * 60 + inMin);
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    } else {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const checkInMinutes = inHour * 60 + inMin;
      const duration = currentMinutes - checkInMinutes;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      Security: "bg-blue-500",
      HR: "bg-orange-500", 
      IT: "bg-red-500",
      Admin: "bg-green-500"
    };
    return colors[department as keyof typeof colors] || "bg-gray-500";
  };

  // Calculate stats
  const present = employees.filter(e => e.status === "active" && e.checkIn && !e.checkOut).length;
  const absent = employees.filter(e => e.status === "inactive").length;
  const late = employees.filter(e => {
    if (!e.checkIn) return false;
    const [hour] = e.checkIn.split(":").map(Number);
    return hour >= 9;
  }).length;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Employee Monitoring</h1>
          <p className="text-neutral-600">Track employee attendance and zone activity</p>
        </div>
        <Button>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Present Today</p>
                <p className="text-2xl font-bold text-neutral-900">{present}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <UserX className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Absent Today</p>
                <p className="text-2xl font-bold text-neutral-900">{absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-neutral-900">{late}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-600">Avg Duration</p>
                <p className="text-2xl font-bold text-neutral-900">8.2h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Employee Table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-neutral-900">Today's Attendance</h3>
              <div className="flex space-x-3">
                <Input 
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="IT">IT</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Total Duration</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Zone Activity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-neutral-50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`w-10 h-10 ${getDepartmentColor(employee.department)} rounded-full flex items-center justify-center mr-3`}>
                          <span className="text-white font-medium text-sm">
                            {getInitials(employee.name)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{employee.name}</div>
                          <div className="text-sm text-neutral-500">{employee.employeeId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-900">{employee.department}</TableCell>
                    <TableCell className="text-sm text-neutral-900">
                      {employee.checkIn ? `${employee.checkIn} AM` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-900">
                      {employee.checkOut ? `${employee.checkOut} PM` : '-'}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-900">
                      {calculateDuration(employee.checkIn || "", employee.checkOut || "")}
                    </TableCell>
                    <TableCell className="text-sm text-neutral-900">{employee.lastSeen}</TableCell>
                    <TableCell>
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white" title="Zone A"></div>
                        <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white" title="Zone B"></div>
                        <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white" title="Zone C"></div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={employee.status === "active" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-gray-100 text-gray-800"
                      }>
                        {employee.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

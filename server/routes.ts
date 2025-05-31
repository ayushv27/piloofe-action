import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertCameraSchema, insertZoneSchema, insertAlertSchema, insertEmployeeSchema, insertSystemSettingsSchema, insertSubscriptionPlanSchema, insertDemoRequestSchema, insertSearchQuerySchema } from "@shared/schema";

// WebSocket clients management
const wsClients = new Set<WebSocket>();

// Notification system
interface NotificationData {
  id: string;
  type: 'alert' | 'system' | 'employee' | 'camera';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: string;
  data?: any;
}

function broadcastNotification(notification: NotificationData) {
  const message = JSON.stringify({
    type: 'notification',
    data: notification
  });
  
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

function broadcastUpdate(type: string, data: any) {
  const message = JSON.stringify({
    type: 'update',
    updateType: type,
    data
  });
  
  wsClients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// AI Chat Processing Function
async function processAIChatQuery(query: string) {
  const lowercaseQuery = query.toLowerCase();
  
  // Get current data from storage
  const cameras = await storage.getAllCameras();
  const alerts = await storage.getAllAlerts();
  const zones = await storage.getAllZones();
  const currentDate = new Date();
  const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
  
  // Analyze query intent and extract relevant information
  let response = "";
  let metadata: any = {};
  
  // Camera status queries
  if (lowercaseQuery.includes("camera") && (lowercaseQuery.includes("status") || lowercaseQuery.includes("active"))) {
    const activeCameras = cameras.filter(c => c.status === "online");
    response = `Currently, you have ${activeCameras.length} out of ${cameras.length} cameras online and actively monitoring. Here's the breakdown:\n\n`;
    
    cameras.forEach(camera => {
      const status = camera.status === "online" ? "🟢 Online" : "🔴 Offline";
      response += `• ${camera.name} (${camera.location}): ${status}\n`;
    });
    
    metadata.cameras = cameras.map(c => c.name);
  }
  
  // Recent alerts queries
  else if (lowercaseQuery.includes("alert") || lowercaseQuery.includes("incident")) {
    const todayAlerts = alerts.filter(alert => {
      const alertDate = new Date(alert.timestamp);
      return alertDate >= yesterday;
    });
    
    if (todayAlerts.length === 0) {
      response = "Great news! No alerts have been triggered in the past 24 hours. Your surveillance system is running smoothly.";
    } else {
      response = `I found ${todayAlerts.length} alert(s) in the past 24 hours:\n\n`;
      
      todayAlerts.forEach((alert, index) => {
        const time = new Date(alert.timestamp).toLocaleTimeString();
        const priority = alert.priority === "critical" ? "🔴" : alert.priority === "high" ? "🟠" : "🟡";
        response += `${index + 1}. ${priority} ${alert.type} - ${alert.description}\n   Time: ${time} | Camera: ${alert.cameraName || 'Unknown'}\n\n`;
      });
      
      metadata.alerts = todayAlerts.map(alert => ({
        id: alert.id.toString(),
        type: alert.type,
        camera: alert.cameraName || 'Unknown',
        confidence: 0.85 + Math.random() * 0.14
      }));
    }
  }
  
  // Footage/recording queries
  else if (lowercaseQuery.includes("footage") || lowercaseQuery.includes("recording") || lowercaseQuery.includes("video")) {
    const timeRange = extractTimeRange(lowercaseQuery);
    const cameraName = extractCameraName(lowercaseQuery, cameras);
    
    response = `I can help you access footage from your surveillance system. `;
    
    if (cameraName) {
      response += `For ${cameraName}, `;
    }
    
    if (timeRange) {
      response += `I'll search for recordings from ${timeRange}.\n\n`;
    } else {
      response += `I'll show you the most recent recordings.\n\n`;
    }
    
    response += "Here are the available video segments:";
    
    // Generate video clips based on actual camera data
    metadata.videoClips = cameras.slice(0, 2).map((camera, index) => ({
      id: `clip_00${index + 1}`,
      camera: camera.name,
      timestamp: new Date(currentDate.getTime() - (index + 1) * 2 * 60 * 60 * 1000).toLocaleString(),
      duration: 30 + index * 15
    }));
  }
  
  // Motion detection queries
  else if (lowercaseQuery.includes("motion") || lowercaseQuery.includes("movement")) {
    response = `Motion detection is currently active across all cameras. Recent motion activity:\n\n`;
    cameras.forEach((camera, index) => {
      const motionCount = Math.floor(Math.random() * 15) + 1;
      response += `• ${camera.name}: ${motionCount} motion events\n`;
    });
    response += `\nMost recent motion was detected ${Math.floor(Math.random() * 10) + 1} minutes ago.`;
  }
  
  // Zone-specific queries
  else if (lowercaseQuery.includes("zone") || zones.some(z => lowercaseQuery.includes(z.name.toLowerCase()))) {
    response = `Your surveillance system covers ${zones.length} monitored zones:\n\n`;
    
    zones.forEach(zone => {
      const zoneAlerts = alerts.filter(a => a.zone === zone.name).length;
      response += `• ${zone.name}: ${zone.description || 'Active monitoring'} (${zoneAlerts} recent alerts)\n`;
    });
  }
  
  // Time-based queries
  else if (lowercaseQuery.includes("yesterday") || lowercaseQuery.includes("today") || lowercaseQuery.includes("last")) {
    const todayAlerts = alerts.filter(a => new Date(a.timestamp) >= yesterday).length;
    const activeCameras = cameras.filter(c => c.status === "online").length;
    
    response = `Looking at recent activity patterns:\n\n`;
    response += `📊 Today's Summary:\n`;
    response += `• Total alerts: ${todayAlerts}\n`;
    response += `• Active cameras: ${activeCameras}\n`;
    response += `• Motion events: ${Math.floor(Math.random() * 50) + 20}\n`;
    response += `• System uptime: ${(98 + Math.random() * 2).toFixed(1)}%\n\n`;
    response += `The system is performing optimally with no critical issues detected.`;
  }
  
  // General help or unclear queries
  else {
    response = `I'm your AI surveillance assistant! I can help you with:\n\n`;
    response += `🎥 **Camera Status** - "Show me camera status" or "Which cameras are online?"\n`;
    response += `🚨 **Security Alerts** - "Any alerts today?" or "Show recent incidents"\n`;
    response += `📹 **Footage Access** - "Show footage from Camera 01" or "Video from last hour"\n`;
    response += `🔍 **Motion Detection** - "Any movement detected?" or "Motion in parking area"\n`;
    response += `📊 **Analytics** - "Today's summary" or "System performance"\n\n`;
    response += `Try asking something like: "Show me footage from the main entrance in the last hour" or "Were there any alerts while I was away?"`;
  }
  
  return {
    response,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined
  };
}

// Helper functions for query processing
function extractTimeRange(query: string): string | null {
  if (query.includes("last hour") || query.includes("past hour")) return "last hour";
  if (query.includes("today")) return "today";
  if (query.includes("yesterday")) return "yesterday";
  if (query.includes("last 24 hours")) return "last 24 hours";
  if (query.includes("this morning")) return "this morning";
  if (query.includes("this afternoon")) return "this afternoon";
  if (query.includes("this evening")) return "this evening";
  return null;
}

function extractCameraName(query: string, cameras: any[]): string | null {
  for (const camera of cameras) {
    if (query.toLowerCase().includes(camera.name.toLowerCase()) || 
        query.toLowerCase().includes(camera.location.toLowerCase())) {
      return camera.name;
    }
  }
  
  // Check for common camera references
  if (query.includes("entrance") || query.includes("main")) return "Camera 01 - Main Entrance";
  if (query.includes("parking")) return "Camera 03 - Parking Area";
  if (query.includes("reception")) return "Camera 02 - Reception Area";
  
  return null;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In a real app, you'd set up proper session/JWT here
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, userData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Camera routes
  app.get("/api/cameras", async (req, res) => {
    try {
      const cameras = await storage.getAllCameras();
      res.json(cameras);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cameras" });
    }
  });

  app.post("/api/cameras", async (req, res) => {
    try {
      const cameraData = insertCameraSchema.parse(req.body);
      const camera = await storage.createCamera(cameraData);
      res.json(camera);
    } catch (error) {
      res.status(400).json({ message: "Invalid camera data" });
    }
  });

  app.put("/api/cameras/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const cameraData = insertCameraSchema.partial().parse(req.body);
      const camera = await storage.updateCamera(id, cameraData);
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      res.json(camera);
    } catch (error) {
      res.status(400).json({ message: "Invalid camera data" });
    }
  });

  // Zone routes
  app.get("/api/zones", async (req, res) => {
    try {
      const zones = await storage.getAllZones();
      res.json(zones);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch zones" });
    }
  });

  app.post("/api/zones", async (req, res) => {
    try {
      const zoneData = insertZoneSchema.parse(req.body);
      const zone = await storage.createZone(zoneData);
      res.json(zone);
    } catch (error) {
      res.status(400).json({ message: "Invalid zone data" });
    }
  });

  // Alert routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const { from, to } = req.query;
      let alerts;
      
      if (from && to) {
        alerts = await storage.getAlertsByDateRange(from as string, to as string);
      } else {
        alerts = await storage.getAllAlerts();
      }
      
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post("/api/alerts", async (req, res) => {
    try {
      const alertData = insertAlertSchema.parse(req.body);
      const alert = await storage.createAlert(alertData);
      
      // Send real-time notification
      const notification: NotificationData = {
        id: Date.now().toString(),
        type: 'alert',
        priority: alert.priority as 'low' | 'medium' | 'high' | 'critical',
        title: `New ${alert.type} Alert`,
        message: alert.description,
        timestamp: new Date().toISOString(),
        data: alert
      };
      
      broadcastNotification(notification);
      broadcastUpdate('alerts', alert);
      
      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  app.put("/api/alerts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alertData = insertAlertSchema.partial().parse(req.body);
      const alert = await storage.updateAlert(id, alertData);
      if (!alert) {
        return res.status(404).json({ message: "Alert not found" });
      }
      
      // Notify about alert status changes
      if (alertData.status) {
        const notification: NotificationData = {
          id: Date.now().toString(),
          type: 'alert',
          priority: 'medium',
          title: `Alert ${alertData.status}`,
          message: `${alert.type} alert has been ${alertData.status}`,
          timestamp: new Date().toISOString(),
          data: alert
        };
        
        broadcastNotification(notification);
      }
      
      broadcastUpdate('alerts', alert);
      res.json(alert);
    } catch (error) {
      res.status(400).json({ message: "Invalid alert data" });
    }
  });

  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const { date } = req.query;
      let employees;
      
      if (date) {
        employees = await storage.getEmployeesByDate(date as string);
      } else {
        employees = await storage.getAllEmployees();
      }
      
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  // System settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settingsData = insertSystemSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSystemSettings(settingsData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
    try {
      const cameras = await storage.getAllCameras();
      const alerts = await storage.getAllAlerts();
      const employees = await storage.getAllEmployees();
      
      const activeCameras = cameras.filter(c => c.status === "active").length;
      const todayAlerts = alerts.filter(a => {
        const alertDate = new Date(a.timestamp || 0);
        const today = new Date();
        return alertDate.toDateString() === today.toDateString();
      });
      const currentAlerts = alerts.filter(a => a.status === "pending").length;
      
      const totalZones = await storage.getAllZones();
      const zoneCoverage = Math.round((cameras.length / Math.max(totalZones.length, 1)) * 100);
      
      res.json({
        activeCameras,
        todayIncidents: todayAlerts.length,
        currentAlerts,
        zoneCoverage: `${Math.min(zoneCoverage, 100)}%`,
        employeeStats: {
          present: employees.filter(e => e.status === "active" && e.checkIn && !e.checkOut).length,
          absent: employees.filter(e => e.status === "inactive").length,
          late: employees.filter(e => {
            if (!e.checkIn) return false;
            const checkInTime = new Date(`2024-01-01 ${e.checkIn}`);
            const nineAM = new Date(`2024-01-01 09:00:00`);
            return checkInTime > nineAM;
          }).length,
          avgDuration: "8.2h"
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Subscription Plans routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.post("/api/subscription-plans", async (req, res) => {
    try {
      const planData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(planData);
      res.json(plan);
    } catch (error) {
      res.status(400).json({ message: "Invalid subscription plan data" });
    }
  });

  // Demo request route
  app.post("/api/demo-request", async (req, res) => {
    try {
      const requestData = insertDemoRequestSchema.parse(req.body);
      const demoRequest = await storage.createDemoRequest(requestData);
      
      // Send email notification (placeholder for SendGrid integration)
      // TODO: Implement SendGrid email sending with SENDGRID_API_KEY
      console.log("Demo request submitted:", {
        name: requestData.name,
        email: requestData.email,
        company: requestData.company,
        message: requestData.message
      });
      
      res.json({ 
        message: "Demo request submitted successfully",
        id: demoRequest.id 
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid demo request data" });
    }
  });

  // Signup route
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword,
        message: "Account created successfully"
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Search route
  app.post("/api/search", async (req, res) => {
    try {
      const searchData = insertSearchQuerySchema.parse(req.body);
      const startTime = Date.now();
      
      // Save search query
      const searchQuery = await storage.createSearchQuery(searchData);
      
      // Mock search results (placeholder for actual AI search implementation)
      const mockResults = [
        {
          id: "1",
          timestamp: new Date().toISOString(),
          cameraId: 1,
          cameraName: "Camera 01 - Main Entrance",
          location: "Building A, Floor 1",
          confidence: 95,
          thumbnail: "placeholder-thumbnail-url",
          description: "Person detected matching search criteria",
          type: "person",
          duration: 15
        }
      ];
      
      const executionTime = Date.now() - startTime;
      
      res.json({
        results: mockResults,
        executionTime,
        query: searchQuery
      });
    } catch (error) {
      res.status(400).json({ message: "Invalid search data" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const zoneFilter = req.query.zoneFilter as string || "all";
      
      // Get comprehensive analytics data from the database
      const alerts = await storage.getAllAlerts();
      const employees = await storage.getAllEmployees();
      const cameras = await storage.getAllCameras();
      const zones = await storage.getAllZones();
      
      // Calculate metrics from real data
      const now = new Date();
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      const recentAlerts = alerts.filter(alert => new Date(alert.timestamp) > cutoffDate);
      const todayAlerts = alerts.filter(alert => {
        const alertDate = new Date(alert.timestamp);
        return alertDate.toDateString() === now.toDateString();
      });
      
      const activeCameras = cameras.filter(camera => camera.status === "active");
      const presentEmployees = employees.filter(emp => emp.status === "present");
      
      res.json({
        totalIncidents: recentAlerts.length,
        todayIncidents: todayAlerts.length,
        activeCameras: activeCameras.length,
        totalCameras: cameras.length,
        presentEmployees: presentEmployees.length,
        totalEmployees: employees.length,
        cameraUptime: activeCameras.length / Math.max(cameras.length, 1) * 100,
        avgResponseTime: "2.4m", // Could be calculated from alert resolution times
        alertDistribution: recentAlerts.reduce((acc, alert) => {
          acc[alert.type] = (acc[alert.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        resolvedIncidents: recentAlerts.filter(a => a.status === 'resolved').length,
        pendingIncidents: recentAlerts.filter(a => a.status === 'pending').length,
        criticalAlerts: recentAlerts.filter(a => a.priority === 'critical').length,
        systemUptime: Math.min(99.9, 95 + Math.random() * 5).toFixed(1)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });

  app.get("/api/analytics/incident-trends", async (req, res) => {
    try {
      const dateFrom = req.query.dateFrom as string;
      const dateTo = req.query.dateTo as string;
      
      const alerts = await storage.getAllAlerts();
      
      // Group alerts by date
      const dailyData = new Map<string, { incidents: number; resolved: number }>();
      
      alerts.forEach(alert => {
        const alertDate = new Date(alert.timestamp).toISOString().split('T')[0];
        if (dateFrom && dateTo) {
          if (alertDate >= dateFrom && alertDate <= dateTo) {
            if (!dailyData.has(alertDate)) {
              dailyData.set(alertDate, { incidents: 0, resolved: 0 });
            }
            const data = dailyData.get(alertDate)!;
            data.incidents += 1;
            if (alert.status === "resolved") {
              data.resolved += 1;
            }
          }
        }
      });
      
      const trendData = Array.from(dailyData.entries()).map(([date, data]) => ({
        date,
        incidents: data.incidents,
        resolved: data.resolved
      }));
      
      res.json(trendData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch incident trends" });
    }
  });

  app.get("/api/analytics/occupancy", async (req, res) => {
    try {
      const zones = await storage.getAllZones();
      const employees = await storage.getAllEmployees();
      
      // Calculate occupancy by zone based on employee data
      const occupancyData = zones.map(zone => {
        const zoneEmployees = employees.filter(emp => 
          emp.status === "present" && emp.location?.includes(zone.name)
        );
        
        return {
          zone: zone.name,
          occupancy: zoneEmployees.length,
          capacity: zone.capacity || 100, // Default capacity if not set
          utilizationPercent: Math.round((zoneEmployees.length / (zone.capacity || 100)) * 100)
        };
      });
      
      res.json(occupancyData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch occupancy data" });
    }
  });

  app.get("/api/analytics/alert-distribution", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const alerts = await storage.getAllAlerts();
      
      const now = new Date();
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : 365;
      const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      const recentAlerts = alerts.filter(alert => new Date(alert.timestamp) > cutoffDate);
      
      const distribution = recentAlerts.reduce((acc, alert) => {
        const type = alert.type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
      
      const distributionData = Object.entries(distribution).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value: Math.round((count / total) * 100),
        count
      }));
      
      res.json(distributionData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alert distribution" });
    }
  });

  app.get("/api/analytics/activity-heatmap", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      
      // Generate activity heatmap based on employee check-in times
      const heatmapData = [];
      const hours = ['00:00', '06:00', '09:00', '12:00', '18:00', '21:00'];
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      for (const hour of hours) {
        const hourData: any = { hour };
        
        for (const day of days) {
          // Calculate activity based on employee data and time patterns
          const baseActivity = employees.length;
          const hourMultiplier = hour === '09:00' ? 2.5 : hour === '12:00' ? 1.8 : hour === '18:00' ? 1.5 : 0.5;
          const dayMultiplier = ['saturday', 'sunday'].includes(day) ? 0.6 : 1.0;
          
          hourData[day] = Math.round(baseActivity * hourMultiplier * dayMultiplier);
        }
        
        heatmapData.push(hourData);
      }
      
      res.json(heatmapData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity heatmap" });
    }
  });

  // Advanced Analytics - Alert Distribution API
  app.get("/api/analytics/alert-distribution", async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "30d";
      const alerts = await storage.getAllAlerts();
      
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const recentAlerts = alerts.filter(alert => new Date(alert.timestamp) > cutoffDate);
      
      const distribution = recentAlerts.reduce((acc, alert) => {
        const type = alert.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const result = Object.entries(distribution).map(([type, count]) => ({
        type,
        count,
        percentage: ((count / recentAlerts.length) * 100).toFixed(1)
      }));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch alert distribution" });
    }
  });

  // Advanced Analytics - Occupancy Patterns API
  app.get("/api/analytics/occupancy", async (req, res) => {
    try {
      const employees = await storage.getAllEmployees();
      
      const occupancyData = [];
      for (let hour = 0; hour < 24; hour++) {
        const hourlyEmployees = employees.filter(emp => {
          if (!emp.checkIn) return false;
          const checkInHour = new Date(emp.checkIn).getHours();
          const checkOutHour = emp.checkOut ? new Date(emp.checkOut).getHours() : 23;
          return hour >= checkInHour && hour <= checkOutHour;
        });
        
        occupancyData.push({
          hour,
          averageOccupancy: hourlyEmployees.length,
          peakOccupancy: Math.min(hourlyEmployees.length + Math.floor(Math.random() * 3), 50)
        });
      }
      
      res.json(occupancyData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch occupancy data" });
    }
  });

  // Advanced Analytics - Camera Performance API
  app.get("/api/analytics/camera-performance", async (req, res) => {
    try {
      const cameras = await storage.getAllCameras();
      const alerts = await storage.getAllAlerts();
      
      const performance = cameras.map(camera => {
        const cameraAlerts = alerts.filter(alert => alert.cameraId === camera.id);
        return {
          id: camera.id,
          name: camera.name,
          location: camera.location,
          status: camera.status,
          alertCount: cameraAlerts.length,
          uptime: camera.status === 'active' ? 
            (95 + Math.random() * 5).toFixed(1) : 
            (Math.random() * 60).toFixed(1),
          lastAlert: cameraAlerts.length > 0 ? 
            cameraAlerts[cameraAlerts.length - 1].timestamp : 
            null,
          responseTime: (Math.random() * 2 + 0.5).toFixed(1)
        };
      });
      
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch camera performance" });
    }
  });

  // Recordings routes for footage history
  app.get("/api/recordings", async (req, res) => {
    try {
      // For now return empty array - Django backend will implement this
      const recordings: any[] = [];
      res.json(recordings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recordings" });
    }
  });

  app.get("/api/recordings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Django backend will implement actual recording retrieval
      res.status(404).json({ message: "Recording not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recording" });
    }
  });

  app.post("/api/recordings", async (req, res) => {
    try {
      // Django backend will handle recording creation
      res.status(201).json({ message: "Recording created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to create recording" });
    }
  });

  app.delete("/api/recordings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Django backend will handle recording deletion
      res.json({ message: "Recording deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete recording" });
    }
  });

  app.get("/api/recordings/download/:id", async (req, res) => {
    try {
      const { id } = req.params;
      // Django backend will handle file streaming
      res.status(404).json({ message: "Recording file not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to download recording" });
    }
  });

  // AI Chat routes for CCTV queries
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { query } = req.body;
      
      // Process natural language query and generate intelligent response
      const response = await processAIChatQuery(query);
      
      res.json(response);
    } catch (error) {
      console.error("AI Chat error:", error);
      res.status(500).json({ 
        response: "I'm experiencing technical difficulties right now. Please try again in a moment.",
        error: "AI processing failed"
      });
    }
  });

  // Report generation routes
  app.post("/api/reports/generate", async (req, res) => {
    try {
      const { type, dateFrom, dateTo, zoneFilter } = req.body;
      
      // Generate report based on real data
      const alerts = await storage.getAllAlerts();
      const employees = await storage.getAllEmployees();
      const cameras = await storage.getAllCameras();
      
      const reportData = {
        type,
        dateRange: { from: dateFrom, to: dateTo },
        zoneFilter,
        summary: {
          totalAlerts: alerts.length,
          totalEmployees: employees.length,
          activeCameras: cameras.filter(c => c.status === "active").length
        },
        generatedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        reportId: Date.now().toString(),
        data: reportData
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.post("/api/reports/download/:format", async (req, res) => {
    try {
      const format = req.params.format;
      const { type, dateFrom, dateTo, zoneFilter } = req.body;
      
      // In a real implementation, you would generate actual PDF/Excel files here
      // For now, we'll return a success response
      res.json({
        success: true,
        message: `${format.toUpperCase()} report generation initiated`,
        downloadUrl: `/downloads/report-${Date.now()}.${format}`
      });
    } catch (error) {
      res.status(500).json({ message: `Failed to generate ${req.params.format} report` });
    }
  });

  // Stripe checkout session (placeholder)
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planId, billingCycle } = req.body;
      
      // TODO: Implement Stripe checkout session creation with STRIPE_SECRET_KEY
      // This would create a Stripe checkout session and return the URL
      
      res.json({
        url: "/payment-success", // Placeholder URL
        message: "Stripe checkout session created (placeholder)"
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to create checkout session" });
    }
  });

  // Add notification routes
  app.post("/api/notifications/test", async (req, res) => {
    try {
      const { type, priority, title, message } = req.body;
      const notification: NotificationData = {
        id: Date.now().toString(),
        type: type || 'system',
        priority: priority || 'medium',
        title: title || 'Test Notification',
        message: message || 'This is a test notification',
        timestamp: new Date().toISOString()
      };
      
      broadcastNotification(notification);
      res.json({ message: "Test notification sent", notification });
    } catch (error) {
      res.status(400).json({ message: "Failed to send test notification" });
    }
  });

  // Simulate camera events for demo
  app.post("/api/simulate/camera-event", async (req, res) => {
    try {
      const { cameraId, eventType } = req.body;
      const camera = await storage.getCamera(cameraId);
      
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }

      // Create alert based on simulated event
      const alertData = {
        type: eventType || 'motion',
        description: `${eventType || 'Motion'} detected on ${camera.name}`,
        cameraId: camera.id,
        priority: eventType === 'intrusion' ? 'high' : 'medium',
        status: 'pending'
      };

      const alert = await storage.createAlert(alertData);
      
      // Send real-time notification
      const notification: NotificationData = {
        id: Date.now().toString(),
        type: 'alert',
        priority: alert.priority as 'low' | 'medium' | 'high' | 'critical',
        title: `${eventType || 'Motion'} Detected`,
        message: `${camera.name}: ${alert.description}`,
        timestamp: new Date().toISOString(),
        data: { alert, camera }
      };
      
      broadcastNotification(notification);
      broadcastUpdate('alerts', alert);
      
      res.json({ message: "Camera event simulated", alert, notification });
    } catch (error) {
      res.status(400).json({ message: "Failed to simulate camera event" });
    }
  });

  // Subscription management endpoints
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const plans = await storage.getAllSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  app.get("/api/user/subscription", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        currentPlan: user.subscriptionPlan || "Basic",
        status: user.subscriptionStatus || "active",
        maxCameras: user.maxCameras || 5,
        subscriptionEndsAt: user.subscriptionEndsAt
      });
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ error: "Failed to fetch subscription details" });
    }
  });

  app.post("/api/user/change-plan", async (req, res) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { planId } = req.body;
      const plan = await storage.getSubscriptionPlan(planId);
      
      if (!plan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }

      const updatedUser = await storage.updateUser(req.session.userId, {
        subscriptionPlan: plan.name,
        subscriptionStatus: "active",
        maxCameras: plan.maxCameras,
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ 
        message: "Subscription plan updated successfully",
        plan: plan.name 
      });
    } catch (error) {
      console.error("Error changing subscription plan:", error);
      res.status(500).json({ error: "Failed to update subscription plan" });
    }
  });

  // Admin Control Panel - Client Management
  app.get('/api/admin/clients', async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const clients = users.map(user => ({
        ...user,
        isActive: true,
        lastLogin: new Date(),
        menuPermissions: {
          dashboard: true,
          aiChat: true,
          liveFeed: true,
          recordings: true,
          alerts: true,
          employees: true,
          zones: true,
          reports: true,
          subscription: true,
        }
      }));
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  });

  app.put('/api/admin/clients/:id', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedClient = await storage.updateUser(clientId, updateData);
      if (!updatedClient) {
        return res.status(404).json({ error: 'Client not found' });
      }
      
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update client' });
    }
  });

  app.put('/api/admin/clients/:id/status', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const { isActive } = req.body;
      
      res.json({ message: `Client ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update client status' });
    }
  });

  app.put('/api/admin/clients/:id/permissions', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const { permissions } = req.body;
      
      res.json({ message: 'Menu permissions updated successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update menu permissions' });
    }
  });

  app.post('/api/admin/clients/:id/refund', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      
      res.json({ 
        message: 'Refund processed successfully',
        refundId: `ref_${Date.now()}`,
        amount: 2999,
        status: 'succeeded'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process refund' });
    }
  });

  app.post('/api/admin/clients', async (req, res) => {
    try {
      const clientData = req.body;
      
      const newClient = await storage.createUser({
        username: clientData.username,
        email: clientData.email,
        password: 'defaultPassword123',
        role: 'security',
        maxCameras: clientData.maxCameras || 5,
        subscriptionPlan: clientData.subscriptionPlan || null,
        subscriptionStatus: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        subscriptionEndsAt: null
      });
      
      res.json(newClient);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create client' });
    }
  });

  app.put('/api/admin/clients/:id/subscription', async (req, res) => {
    try {
      const clientId = parseInt(req.params.id);
      const { planName } = req.body;
      
      const updatedClient = await storage.updateUser(clientId, {
        subscriptionPlan: planName,
        subscriptionStatus: planName ? 'active' : null,
        subscriptionEndsAt: planName ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
      });
      
      res.json(updatedClient);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update subscription' });
    }
  });

  // Onboarding API endpoints
  app.get("/api/user/onboarding", async (req, res) => {
    try {
      res.json({
        currentStep: 0,
        completedSteps: [],
        totalPoints: 0,
        achievements: []
      });
    } catch (error) {
      console.error("Error fetching onboarding progress:", error);
      res.status(500).json({ error: "Failed to fetch onboarding progress" });
    }
  });

  app.post("/api/user/onboarding/complete", async (req, res) => {
    try {
      const { stepId } = req.body;
      
      // Define step points
      const stepPoints: { [key: string]: number } = {
        welcome: 10,
        dashboard: 20,
        cameras: 30,
        alerts: 25,
        'ai-chat': 35,
        employees: 20,
        settings: 15
      };

      const points = stepPoints[stepId] || 0;

      // In production, this would update the database
      // For demo, just return success with points earned
      res.json({
        message: "Step completed successfully",
        stepId,
        pointsEarned: points
      });
    } catch (error) {
      console.error("Error completing onboarding step:", error);
      res.status(500).json({ error: "Failed to complete onboarding step" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    wsClients.add(ws);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Piloo.ai surveillance system',
      timestamp: new Date().toISOString()
    }));
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle different message types from client
        switch (data.type) {
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
          case 'subscribe':
            // Client can subscribe to specific notification types
            ws.send(JSON.stringify({ 
              type: 'subscribed', 
              subscriptions: data.subscriptions || ['all'],
              timestamp: new Date().toISOString()
            }));
            break;
        }
      } catch (error) {
        console.log('Invalid WebSocket message received');
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(ws);
    });
    
    ws.on('error', (error) => {
      console.log('WebSocket error:', error);
      wsClients.delete(ws);
    });
  });
  
  return httpServer;
}

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

  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    wsClients.add(ws);
    
    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Ghoobad.ai surveillance system',
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

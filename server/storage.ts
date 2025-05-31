import { 
  users, cameras, zones, alerts, employees, systemSettings, recordings, subscriptionPlans, demoRequests, searchQueries,
  type User, type InsertUser, type Camera, type InsertCamera,
  type Zone, type InsertZone, type Alert, type InsertAlert,
  type Employee, type InsertEmployee, type SystemSettings, type InsertSystemSettings,
  type Recording, type InsertRecording, type SubscriptionPlan, type InsertSubscriptionPlan, 
  type DemoRequest, type InsertDemoRequest, type SearchQuery, type InsertSearchQuery
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
  // Subscription Plans
  getAllSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  
  // Demo Requests
  createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest>;
  getAllDemoRequests(): Promise<DemoRequest[]>;
  updateDemoRequest(id: number, request: Partial<InsertDemoRequest>): Promise<DemoRequest | undefined>;
  
  // Search Queries
  createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery>;
  getUserSearchQueries(userId: number): Promise<SearchQuery[]>;
  
  // Cameras
  getCamera(id: number): Promise<Camera | undefined>;
  getAllCameras(): Promise<Camera[]>;
  createCamera(camera: InsertCamera): Promise<Camera>;
  updateCamera(id: number, camera: Partial<InsertCamera>): Promise<Camera | undefined>;
  deleteCamera(id: number): Promise<boolean>;
  
  // Zones
  getZone(id: number): Promise<Zone | undefined>;
  getAllZones(): Promise<Zone[]>;
  createZone(zone: InsertZone): Promise<Zone>;
  updateZone(id: number, zone: Partial<InsertZone>): Promise<Zone | undefined>;
  deleteZone(id: number): Promise<boolean>;
  
  // Alerts
  getAlert(id: number): Promise<Alert | undefined>;
  getAllAlerts(): Promise<Alert[]>;
  getAlertsByDateRange(from: string, to: string): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert | undefined>;
  deleteAlert(id: number): Promise<boolean>;
  
  // Employees
  getEmployee(id: number): Promise<Employee | undefined>;
  getAllEmployees(): Promise<Employee[]>;
  getEmployeesByDate(date: string): Promise<Employee[]>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number): Promise<boolean>;
  
  // System Settings
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings>;
  
  // Recordings
  getRecording(id: number): Promise<Recording | undefined>;
  getAllRecordings(): Promise<Recording[]>;
  getRecordingsByCamera(cameraId: number): Promise<Recording[]>;
  getRecordingsByDateRange(startDate: Date, endDate: Date): Promise<Recording[]>;
  getRecordingsByFilters(filters: {
    cameraId?: number;
    startDate?: Date;
    endDate?: Date;
    quality?: string;
    hasMotion?: boolean;
  }): Promise<Recording[]>;
  createRecording(recording: InsertRecording): Promise<Recording>;
  updateRecording(id: number, recording: Partial<InsertRecording>): Promise<Recording | undefined>;
  deleteRecording(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cameras: Map<number, Camera>;
  private zones: Map<number, Zone>;
  private alerts: Map<number, Alert>;
  private employees: Map<number, Employee>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private demoRequests: Map<number, DemoRequest>;
  private searchQueries: Map<number, SearchQuery>;
  private recordings: Map<number, Recording>;
  private systemSettings: SystemSettings | undefined;
  private currentUserId: number;
  private currentCameraId: number;
  private currentZoneId: number;
  private currentAlertId: number;
  private currentEmployeeId: number;
  private currentSubscriptionPlanId: number;
  private currentDemoRequestId: number;
  private currentSearchQueryId: number;
  private currentRecordingId: number;

  constructor() {
    this.users = new Map();
    this.cameras = new Map();
    this.zones = new Map();
    this.alerts = new Map();
    this.employees = new Map();
    this.subscriptionPlans = new Map();
    this.demoRequests = new Map();
    this.searchQueries = new Map();
    this.recordings = new Map();
    this.currentUserId = 1;
    this.currentCameraId = 1;
    this.currentZoneId = 1;
    this.currentAlertId = 1;
    this.currentEmployeeId = 1;
    this.currentSubscriptionPlanId = 1;
    this.currentDemoRequestId = 1;
    this.currentSearchQueryId = 1;
    this.currentRecordingId = 1;
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize default admin user
    this.createUser({
      username: "admin",
      email: "admin@company.com",
      password: "admin123",
      role: "admin"
    });

    // Initialize system settings
    this.systemSettings = {
      id: 1,
      alertsIntrusion: true,
      alertsMotion: true,
      alertsLoitering: false,
      alertsVehicle: true,
      globalSensitivity: 6,
      notificationsEmail: true,
      notificationsSms: false,
      notificationsPush: true,
      dataRetention: 90,
    };

    // Initialize sample cameras
    this.createCamera({
      name: "Camera 01 - Main Entrance",
      location: "Building A, Floor 1",
      ip: "192.168.1.101",
      status: "active",
      assignedZone: "entrance-a",
      sensitivity: 7,
    });

    this.createCamera({
      name: "Camera 02 - Hallway",
      location: "Building A, Floor 1", 
      ip: "192.168.1.102",
      status: "active",
      assignedZone: "hallway-1",
      sensitivity: 5,
    });

    this.createCamera({
      name: "Camera 03 - Parking",
      location: "Building A, Basement",
      ip: "192.168.1.103", 
      status: "maintenance",
      assignedZone: "parking",
      sensitivity: 8,
    });

    this.createCamera({
      name: "Camera 04 - Break Room",
      location: "Building A, Floor 2",
      ip: "192.168.1.104",
      status: "active",
      assignedZone: "break-room",
      sensitivity: 6,
    });

    // Initialize zones
    this.createZone({
      name: "Entrance A",
      type: "entrance",
      description: "Main building entrance"
    });

    this.createZone({
      name: "Hallway 1",
      type: "common", 
      description: "First floor hallway"
    });

    this.createZone({
      name: "Parking",
      type: "restricted",
      description: "Underground parking garage"
    });

    this.createZone({
      name: "Break Room",
      type: "common",
      description: "Employee break room"
    });

    // Initialize sample alerts
    this.createAlert({
      type: "intrusion",
      description: "Unauthorized person detected in restricted area",
      cameraId: 1,
      priority: "high",
      status: "pending"
    });

    this.createAlert({
      type: "motion",
      description: "Motion detected in parking area after hours",
      cameraId: 3,
      priority: "medium",
      status: "resolved"
    });

    // Initialize sample employees
    const today = new Date().toISOString().split('T')[0];
    this.createEmployee({
      name: "John Doe",
      employeeId: "EMP001",
      department: "Security",
      checkIn: "08:30",
      checkOut: null,
      lastSeen: "Zone A - 5m ago",
      status: "active",
      date: today
    });

    this.createEmployee({
      name: "Jane Smith",
      employeeId: "EMP002", 
      department: "HR",
      checkIn: "09:15",
      checkOut: "17:30",
      lastSeen: "Zone D - 2m ago",
      status: "active",
      date: today
    });

    // Initialize subscription plans
    this.createSubscriptionPlan({
      name: "Basic",
      monthlyPrice: "29",
      yearlyPrice: "290",
      maxCameras: 5,
      features: ["5 cameras", "Motion detection", "30-day cloud storage", "Email alerts", "Mobile app access"],
      description: "Perfect for small businesses and home use",
      isPopular: false,
      isActive: true
    });

    this.createSubscriptionPlan({
      name: "Professional",
      monthlyPrice: "79",
      yearlyPrice: "790", 
      maxCameras: 15,
      features: ["15 cameras", "AI-powered analytics", "90-day cloud storage", "Real-time alerts", "Priority support", "Advanced reporting"],
      description: "Ideal for growing businesses",
      isPopular: true,
      isActive: true
    });

    this.createSubscriptionPlan({
      name: "Enterprise",
      monthlyPrice: "199",
      yearlyPrice: "1990",
      maxCameras: 50,
      features: ["50 cameras", "Custom AI models", "Unlimited cloud storage", "24/7 phone support", "API access", "White-label solution"],
      description: "For large organizations and enterprises",
      isPopular: false,
      isActive: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser,
      id, 
      createdAt: new Date(),
      role: insertUser.role || "security"
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updateData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updateData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Camera methods
  async getCamera(id: number): Promise<Camera | undefined> {
    return this.cameras.get(id);
  }

  async getAllCameras(): Promise<Camera[]> {
    return Array.from(this.cameras.values());
  }

  async createCamera(insertCamera: InsertCamera): Promise<Camera> {
    const id = this.currentCameraId++;
    const camera: Camera = { 
      ...insertCamera, 
      id,
      status: insertCamera.status || "active",
      assignedZone: insertCamera.assignedZone || null,
      sensitivity: insertCamera.sensitivity || 7
    };
    this.cameras.set(id, camera);
    return camera;
  }

  async updateCamera(id: number, updateData: Partial<InsertCamera>): Promise<Camera | undefined> {
    const camera = this.cameras.get(id);
    if (!camera) return undefined;
    
    const updatedCamera = { ...camera, ...updateData };
    this.cameras.set(id, updatedCamera);
    return updatedCamera;
  }

  async deleteCamera(id: number): Promise<boolean> {
    return this.cameras.delete(id);
  }

  // Zone methods
  async getZone(id: number): Promise<Zone | undefined> {
    return this.zones.get(id);
  }

  async getAllZones(): Promise<Zone[]> {
    return Array.from(this.zones.values());
  }

  async createZone(insertZone: InsertZone): Promise<Zone> {
    const id = this.currentZoneId++;
    const zone: Zone = { 
      ...insertZone, 
      id,
      description: insertZone.description || null
    };
    this.zones.set(id, zone);
    return zone;
  }

  async updateZone(id: number, updateData: Partial<InsertZone>): Promise<Zone | undefined> {
    const zone = this.zones.get(id);
    if (!zone) return undefined;
    
    const updatedZone = { ...zone, ...updateData };
    this.zones.set(id, updatedZone);
    return updatedZone;
  }

  async deleteZone(id: number): Promise<boolean> {
    return this.zones.delete(id);
  }

  // Alert methods
  async getAlert(id: number): Promise<Alert | undefined> {
    return this.alerts.get(id);
  }

  async getAllAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  async getAlertsByDateRange(from: string, to: string): Promise<Alert[]> {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    return Array.from(this.alerts.values()).filter(alert => {
      const alertDate = new Date(alert.timestamp || 0);
      return alertDate >= fromDate && alertDate <= toDate;
    });
  }

  async createAlert(insertAlert: InsertAlert): Promise<Alert> {
    const id = this.currentAlertId++;
    const alert: Alert = { 
      ...insertAlert, 
      id, 
      timestamp: new Date(),
      status: insertAlert.status || "pending",
      cameraId: insertAlert.cameraId || null
    };
    this.alerts.set(id, alert);
    return alert;
  }

  async updateAlert(id: number, updateData: Partial<InsertAlert>): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const updatedAlert = { ...alert, ...updateData };
    this.alerts.set(id, updatedAlert);
    return updatedAlert;
  }

  async deleteAlert(id: number): Promise<boolean> {
    return this.alerts.delete(id);
  }

  // Employee methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployeesByDate(date: string): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(emp => emp.date === date);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = this.currentEmployeeId++;
    const employee: Employee = { 
      ...insertEmployee, 
      id,
      status: insertEmployee.status || "active",
      checkIn: insertEmployee.checkIn || null,
      checkOut: insertEmployee.checkOut || null,
      lastSeen: insertEmployee.lastSeen || null
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee = { ...employee, ...updateData };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    return this.employees.delete(id);
  }

  // System Settings methods
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    return this.systemSettings;
  }

  async updateSystemSettings(updateData: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    if (!this.systemSettings) {
      this.systemSettings = {
        id: 1,
        alertsIntrusion: true,
        alertsMotion: true,
        alertsLoitering: false,
        alertsVehicle: true,
        globalSensitivity: 6,
        notificationsEmail: true,
        notificationsSms: false,
        notificationsPush: true,
        dataRetention: 90,
        ...updateData
      };
    } else {
      this.systemSettings = { ...this.systemSettings, ...updateData };
    }
    return this.systemSettings;
  }

  // Subscription Plans methods
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }

  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const plan: SubscriptionPlan = { 
      id: this.currentSubscriptionPlanId++, 
      ...insertPlan,
      features: insertPlan.features || [],
      popular: insertPlan.popular || false
    };
    this.subscriptionPlans.set(plan.id, plan);
    return plan;
  }

  async updateSubscriptionPlan(id: number, updateData: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...updateData };
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }

  // Demo Requests methods
  async createDemoRequest(insertRequest: InsertDemoRequest): Promise<DemoRequest> {
    const request: DemoRequest = { 
      id: this.currentDemoRequestId++, 
      ...insertRequest,
      status: insertRequest.status || 'pending',
      createdAt: new Date()
    };
    this.demoRequests.set(request.id, request);
    return request;
  }

  async getAllDemoRequests(): Promise<DemoRequest[]> {
    return Array.from(this.demoRequests.values());
  }

  async updateDemoRequest(id: number, updateData: Partial<InsertDemoRequest>): Promise<DemoRequest | undefined> {
    const request = this.demoRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest = { ...request, ...updateData };
    this.demoRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  // Search Queries methods
  async createSearchQuery(insertQuery: InsertSearchQuery): Promise<SearchQuery> {
    const query: SearchQuery = { 
      id: this.currentSearchQueryId++, 
      ...insertQuery,
      createdAt: new Date()
    };
    this.searchQueries.set(query.id, query);
    return query;
  }

  async getUserSearchQueries(userId: number): Promise<SearchQuery[]> {
    return Array.from(this.searchQueries.values()).filter(q => q.userId === userId);
  }

  // Recordings methods
  async getRecording(id: number): Promise<Recording | undefined> {
    return this.recordings.get(id);
  }

  async getAllRecordings(): Promise<Recording[]> {
    return Array.from(this.recordings.values());
  }

  async getRecordingsByCamera(cameraId: number): Promise<Recording[]> {
    return Array.from(this.recordings.values()).filter(r => r.cameraId === cameraId);
  }

  async getRecordingsByDateRange(startDate: Date, endDate: Date): Promise<Recording[]> {
    return Array.from(this.recordings.values()).filter(r => {
      const recordingDate = new Date(r.timestamp);
      return recordingDate >= startDate && recordingDate <= endDate;
    });
  }

  async getRecordingsByFilters(filters: {
    cameraId?: number;
    startDate?: Date;
    endDate?: Date;
    quality?: string;
    hasMotion?: boolean;
  }): Promise<Recording[]> {
    let recordings = Array.from(this.recordings.values());

    if (filters.cameraId) {
      recordings = recordings.filter(r => r.cameraId === filters.cameraId);
    }

    if (filters.startDate && filters.endDate) {
      recordings = recordings.filter(r => {
        const recordingDate = new Date(r.timestamp);
        return recordingDate >= filters.startDate! && recordingDate <= filters.endDate!;
      });
    }

    if (filters.quality) {
      recordings = recordings.filter(r => r.quality === filters.quality);
    }

    if (filters.hasMotion !== undefined) {
      recordings = recordings.filter(r => r.hasMotion === filters.hasMotion);
    }

    return recordings;
  }

  async createRecording(insertRecording: InsertRecording): Promise<Recording> {
    const recording: Recording = { 
      id: this.currentRecordingId++, 
      ...insertRecording,
      timestamp: insertRecording.timestamp || new Date(),
      size: insertRecording.size || 0,
      hasMotion: insertRecording.hasMotion || false
    };
    this.recordings.set(recording.id, recording);
    return recording;
  }

  async updateRecording(id: number, updateData: Partial<InsertRecording>): Promise<Recording | undefined> {
    const recording = this.recordings.get(id);
    if (!recording) return undefined;
    
    const updatedRecording = { ...recording, ...updateData };
    this.recordings.set(id, updatedRecording);
    return updatedRecording;
  }

  async deleteRecording(id: number): Promise<boolean> {
    return this.recordings.delete(id);
  }
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Camera methods
  async getCamera(id: number): Promise<Camera | undefined> {
    const [camera] = await db.select().from(cameras).where(eq(cameras.id, id));
    return camera || undefined;
  }

  async getAllCameras(): Promise<Camera[]> {
    return await db.select().from(cameras);
  }

  async createCamera(camera: InsertCamera): Promise<Camera> {
    const [newCamera] = await db
      .insert(cameras)
      .values(camera)
      .returning();
    return newCamera;
  }

  async updateCamera(id: number, camera: Partial<InsertCamera>): Promise<Camera | undefined> {
    const [updatedCamera] = await db
      .update(cameras)
      .set(camera)
      .where(eq(cameras.id, id))
      .returning();
    return updatedCamera || undefined;
  }

  async deleteCamera(id: number): Promise<boolean> {
    const result = await db.delete(cameras).where(eq(cameras.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Zone methods
  async getZone(id: number): Promise<Zone | undefined> {
    const [zone] = await db.select().from(zones).where(eq(zones.id, id));
    return zone || undefined;
  }

  async getAllZones(): Promise<Zone[]> {
    return await db.select().from(zones);
  }

  async createZone(zone: InsertZone): Promise<Zone> {
    const [newZone] = await db
      .insert(zones)
      .values(zone)
      .returning();
    return newZone;
  }

  async updateZone(id: number, zone: Partial<InsertZone>): Promise<Zone | undefined> {
    const [updatedZone] = await db
      .update(zones)
      .set(zone)
      .where(eq(zones.id, id))
      .returning();
    return updatedZone || undefined;
  }

  async deleteZone(id: number): Promise<boolean> {
    const result = await db.delete(zones).where(eq(zones.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Alert methods
  async getAlert(id: number): Promise<Alert | undefined> {
    const [alert] = await db.select().from(alerts).where(eq(alerts.id, id));
    return alert || undefined;
  }

  async getAllAlerts(): Promise<Alert[]> {
    return await db.select().from(alerts).orderBy(alerts.timestamp);
  }

  async getAlertsByDateRange(from: string, to: string): Promise<Alert[]> {
    return await db.select().from(alerts);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const [newAlert] = await db
      .insert(alerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async updateAlert(id: number, alert: Partial<InsertAlert>): Promise<Alert | undefined> {
    const [updatedAlert] = await db
      .update(alerts)
      .set(alert)
      .where(eq(alerts.id, id))
      .returning();
    return updatedAlert || undefined;
  }

  async deleteAlert(id: number): Promise<boolean> {
    const result = await db.delete(alerts).where(eq(alerts.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Employee methods
  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getAllEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployeesByDate(date: string): Promise<Employee[]> {
    return await db.select().from(employees).where(eq(employees.date, date));
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const [newEmployee] = await db
      .insert(employees)
      .values(employee)
      .returning();
    return newEmployee;
  }

  async updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const [updatedEmployee] = await db
      .update(employees)
      .set(employee)
      .where(eq(employees.id, id))
      .returning();
    return updatedEmployee || undefined;
  }

  async deleteEmployee(id: number): Promise<boolean> {
    const result = await db.delete(employees).where(eq(employees.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // System Settings methods
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    const [settings] = await db.select().from(systemSettings).limit(1);
    return settings || undefined;
  }

  async updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    const existing = await this.getSystemSettings();
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set(settings)
        .where(eq(systemSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values(settings)
        .returning();
      return created;
    }
  }

  // Subscription Plans methods
  async getAllSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isActive, true));
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    const [plan] = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
    return plan || undefined;
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const [newPlan] = await db
      .insert(subscriptionPlans)
      .values(plan)
      .returning();
    return newPlan;
  }

  async updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const [updatedPlan] = await db
      .update(subscriptionPlans)
      .set(plan)
      .where(eq(subscriptionPlans.id, id))
      .returning();
    return updatedPlan || undefined;
  }

  // Demo Requests methods
  async createDemoRequest(request: InsertDemoRequest): Promise<DemoRequest> {
    const [newRequest] = await db
      .insert(demoRequests)
      .values(request)
      .returning();
    return newRequest;
  }

  async getAllDemoRequests(): Promise<DemoRequest[]> {
    return await db.select().from(demoRequests);
  }

  async updateDemoRequest(id: number, request: Partial<InsertDemoRequest>): Promise<DemoRequest | undefined> {
    const [updatedRequest] = await db
      .update(demoRequests)
      .set(request)
      .where(eq(demoRequests.id, id))
      .returning();
    return updatedRequest || undefined;
  }

  // Search Queries methods
  async createSearchQuery(query: InsertSearchQuery): Promise<SearchQuery> {
    const [newQuery] = await db
      .insert(searchQueries)
      .values(query)
      .returning();
    return newQuery;
  }

  async getUserSearchQueries(userId: number): Promise<SearchQuery[]> {
    return await db.select().from(searchQueries).where(eq(searchQueries.userId, userId));
  }
}

export const storage = new DatabaseStorage();

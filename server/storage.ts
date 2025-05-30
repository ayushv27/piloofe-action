import { 
  users, cameras, zones, alerts, employees, systemSettings,
  type User, type InsertUser, type Camera, type InsertCamera,
  type Zone, type InsertZone, type Alert, type InsertAlert,
  type Employee, type InsertEmployee, type SystemSettings, type InsertSystemSettings
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private cameras: Map<number, Camera>;
  private zones: Map<number, Zone>;
  private alerts: Map<number, Alert>;
  private employees: Map<number, Employee>;
  private systemSettings: SystemSettings | undefined;
  private currentUserId: number;
  private currentCameraId: number;
  private currentZoneId: number;
  private currentAlertId: number;
  private currentEmployeeId: number;

  constructor() {
    this.users = new Map();
    this.cameras = new Map();
    this.zones = new Map();
    this.alerts = new Map();
    this.employees = new Map();
    this.currentUserId = 1;
    this.currentCameraId = 1;
    this.currentZoneId = 1;
    this.currentAlertId = 1;
    this.currentEmployeeId = 1;
    
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
      createdAt: new Date() 
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
    const camera: Camera = { ...insertCamera, id };
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
    const zone: Zone = { ...insertZone, id };
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
      timestamp: new Date() 
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
    const employee: Employee = { ...insertEmployee, id };
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
}

export const storage = new MemStorage();

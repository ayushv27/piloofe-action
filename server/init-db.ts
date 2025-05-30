import { db } from "./db";
import { users, cameras, zones, alerts, employees, systemSettings, subscriptionPlans } from "@shared/schema";

async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database with sample data...");

    // Clear existing data
    await db.delete(alerts);
    await db.delete(employees);
    await db.delete(cameras);
    await db.delete(zones);
    await db.delete(users);
    await db.delete(systemSettings);

    // Create default admin user
    const [adminUser] = await db.insert(users).values({
      username: "admin",
      email: "admin@company.com",
      password: "admin123",
      role: "admin"
    }).returning();
    console.log("✅ Created admin user");

    // Create additional users
    await db.insert(users).values([
      {
        username: "security_manager",
        email: "security@company.com",
        password: "security123",
        role: "security"
      },
      {
        username: "hr_manager",
        email: "hr@company.com",
        password: "hr123",
        role: "hr"
      }
    ]);
    console.log("✅ Created additional users");

    // Create zones
    const [entranceZone] = await db.insert(zones).values({
      name: "Entrance A",
      type: "entrance",
      description: "Main building entrance"
    }).returning();

    const [hallwayZone] = await db.insert(zones).values({
      name: "Hallway 1",
      type: "common",
      description: "First floor hallway"
    }).returning();

    const [parkingZone] = await db.insert(zones).values({
      name: "Parking",
      type: "restricted",
      description: "Underground parking garage"
    }).returning();

    const [breakRoomZone] = await db.insert(zones).values({
      name: "Break Room",
      type: "common",
      description: "Employee break room"
    }).returning();
    console.log("✅ Created zones");

    // Create cameras
    const [camera1] = await db.insert(cameras).values({
      name: "Camera 01 - Main Entrance",
      location: "Building A, Floor 1",
      ip: "192.168.1.101",
      status: "active",
      assignedZone: "entrance-a",
      sensitivity: 7
    }).returning();

    const [camera2] = await db.insert(cameras).values({
      name: "Camera 02 - Hallway",
      location: "Building A, Floor 1",
      ip: "192.168.1.102",
      status: "active",
      assignedZone: "hallway-1",
      sensitivity: 5
    }).returning();

    const [camera3] = await db.insert(cameras).values({
      name: "Camera 03 - Parking",
      location: "Building A, Basement",
      ip: "192.168.1.103",
      status: "maintenance",
      assignedZone: "parking",
      sensitivity: 8
    }).returning();

    const [camera4] = await db.insert(cameras).values({
      name: "Camera 04 - Break Room",
      location: "Building A, Floor 2",
      ip: "192.168.1.104",
      status: "active",
      assignedZone: "break-room",
      sensitivity: 6
    }).returning();
    console.log("✅ Created cameras");

    // Create alerts
    await db.insert(alerts).values([
      {
        type: "intrusion",
        description: "Unauthorized person detected in restricted area",
        cameraId: camera1.id,
        priority: "high",
        status: "pending"
      },
      {
        type: "motion",
        description: "Motion detected in parking area after hours",
        cameraId: camera3.id,
        priority: "medium",
        status: "resolved"
      },
      {
        type: "loitering",
        description: "Person loitering near entrance for extended period",
        cameraId: camera1.id,
        priority: "low",
        status: "pending"
      },
      {
        type: "vehicle",
        description: "Unauthorized vehicle in restricted zone",
        cameraId: camera3.id,
        priority: "high",
        status: "resolved"
      }
    ]);
    console.log("✅ Created alerts");

    // Create employees
    const today = new Date().toISOString().split('T')[0];
    await db.insert(employees).values([
      {
        name: "John Doe",
        employeeId: "EMP001",
        department: "Security",
        checkIn: "08:30",
        checkOut: null,
        lastSeen: "Zone A - 5m ago",
        status: "active",
        date: today
      },
      {
        name: "Jane Smith",
        employeeId: "EMP002",
        department: "HR",
        checkIn: "09:15",
        checkOut: "17:30",
        lastSeen: "Zone D - 2m ago",
        status: "active",
        date: today
      },
      {
        name: "Mike Brown",
        employeeId: "EMP003",
        department: "IT",
        checkIn: "08:45",
        checkOut: null,
        lastSeen: "Zone B - 15m ago",
        status: "active",
        date: today
      },
      {
        name: "Sarah Wilson",
        employeeId: "EMP004",
        department: "Admin",
        checkIn: "09:00",
        checkOut: "17:00",
        lastSeen: "Zone C - 1h ago",
        status: "inactive",
        date: today
      },
      {
        name: "David Lee",
        employeeId: "EMP005",
        department: "Security",
        checkIn: "10:30",
        checkOut: null,
        lastSeen: "Zone A - 10m ago",
        status: "active",
        date: today
      }
    ]);
    console.log("✅ Created employees");

    // Create system settings
    await db.insert(systemSettings).values({
      alertsIntrusion: true,
      alertsMotion: true,
      alertsLoitering: false,
      alertsVehicle: true,
      globalSensitivity: 6,
      notificationsEmail: true,
      notificationsSms: false,
      notificationsPush: true,
      dataRetention: 90
    });
    console.log("✅ Created system settings");

    // Create subscription plans
    await db.insert(subscriptionPlans).values([
      {
        name: "Free",
        description: "Perfect for home users and hobbyists",
        maxCameras: 1,
        monthlyPrice: "0.00",
        yearlyPrice: "0.00",
        features: [
          "1 camera included",
          "Motion alerts",
          "RTSP Live view",
          "Basic 7-day footage access"
        ],
        isPopular: false,
        isActive: true
      },
      {
        name: "Starter",
        description: "Ideal for small offices and retail shops",
        maxCameras: 3,
        monthlyPrice: "1499.00",
        yearlyPrice: "14990.00",
        features: [
          "Up to 3 cameras",
          "AI anomaly detection (people/fire/animals)",
          "15-day archive",
          "Email alerts",
          "₹400 per extra camera"
        ],
        isPopular: false,
        isActive: true
      },
      {
        name: "Pro",
        description: "Perfect for apartment complexes and medium businesses",
        maxCameras: 10,
        monthlyPrice: "4999.00",
        yearlyPrice: "49990.00",
        features: [
          "Up to 10 cameras",
          "Multimodal search (text/image prompt)",
          "Incident tagging",
          "30-day archive",
          "₹500 per extra camera"
        ],
        isPopular: true,
        isActive: true
      },
      {
        name: "Enterprise",
        description: "For malls, factories, and enterprise campuses",
        maxCameras: 20,
        monthlyPrice: "20000.00",
        yearlyPrice: "200000.00",
        features: [
          "Custom cameras (20+)",
          "Dedicated GPU support",
          "90-day archive",
          "Custom dashboards",
          "Priority support",
          "Custom pricing for extra cameras"
        ],
        isPopular: false,
        isActive: true
      }
    ]);
    console.log("✅ Created subscription plans");

    console.log("🎉 Database initialization completed successfully!");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { initializeDatabase };
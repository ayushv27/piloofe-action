import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("security"), // admin, security, hr
  createdAt: timestamp("created_at").defaultNow(),
});

export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  ip: text("ip").notNull(),
  status: text("status").notNull().default("active"), // active, maintenance, offline
  assignedZone: text("assigned_zone"),
  sensitivity: integer("sensitivity").default(7),
});

export const zones = pgTable("zones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // entrance, office, restricted, common
  description: text("description"),
});

export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // intrusion, motion, loitering, vehicle
  description: text("description").notNull(),
  cameraId: integer("camera_id").references(() => cameras.id),
  priority: text("priority").notNull(), // high, medium, low
  status: text("status").notNull().default("pending"), // pending, resolved, dismissed
  timestamp: timestamp("timestamp").defaultNow(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  employeeId: text("employee_id").notNull().unique(),
  department: text("department").notNull(),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  lastSeen: text("last_seen"),
  status: text("status").notNull().default("active"), // active, inactive
  date: text("date").notNull(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  alertsIntrusion: boolean("alerts_intrusion").default(true),
  alertsMotion: boolean("alerts_motion").default(true),
  alertsLoitering: boolean("alerts_loitering").default(false),
  alertsVehicle: boolean("alerts_vehicle").default(true),
  globalSensitivity: integer("global_sensitivity").default(6),
  notificationsEmail: boolean("notifications_email").default(true),
  notificationsSms: boolean("notifications_sms").default(false),
  notificationsPush: boolean("notifications_push").default(true),
  dataRetention: integer("data_retention").default(90),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCameraSchema = createInsertSchema(cameras).omit({
  id: true,
});

export const insertZoneSchema = createInsertSchema(zones).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  timestamp: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Camera = typeof cameras.$inferSelect;
export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type Zone = typeof zones.$inferSelect;
export type InsertZone = z.infer<typeof insertZoneSchema>;
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

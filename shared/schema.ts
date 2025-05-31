/**
 * Piloo.ai - AI-Powered CCTV Monitoring Platform
 * Copyright (c) 2025 Pyrack Solutions Pvt. Ltd.
 * Website: https://pyrack.com/
 * Licensed under the MIT License
 */

import { pgTable, text, serial, integer, boolean, timestamp, real, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("security"), // admin, security, hr
  subscriptionPlan: text("subscription_plan").default("trial"),
  subscriptionStatus: text("subscription_status").default("active"),
  maxCameras: integer("max_cameras").default(5),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  ip: text("ip").notNull(),
  rtspUrl: text("rtsp_url"),
  status: text("status").notNull().default("active"), // active, maintenance, offline
  assignedZone: text("assigned_zone"),
  sensitivity: integer("sensitivity").default(7),
  recordingEnabled: boolean("recording_enabled").default(true),
  retentionDays: integer("retention_days").default(15),
});

export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  cameraId: integer("camera_id").references(() => cameras.id).notNull(),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  duration: integer("duration").notNull(), // in seconds
  fileSize: integer("file_size").notNull(), // in bytes
  quality: text("quality").notNull().default("720p"), // 480p, 720p, 1080p
  hasMotion: boolean("has_motion").default(false),
  hasAudio: boolean("has_audio").default(true),
  thumbnailPath: text("thumbnail_path"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  maxCameras: integer("max_cameras").notNull(),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull(),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").array(),
  isPopular: boolean("is_popular").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  message: text("message"),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const searchQueries = pgTable("search_queries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  query: text("query").notNull(),
  queryType: text("query_type").notNull(), // text, image, video, audio
  filters: jsonb("filters"), // camera IDs, date range, etc.
  results: jsonb("results"), // search results metadata
  executionTime: integer("execution_time"), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertRecordingSchema = createInsertSchema(recordings).omit({
  id: true,
  createdAt: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).omit({
  id: true,
  createdAt: true,
});

export const insertSearchQuerySchema = createInsertSchema(searchQueries).omit({
  id: true,
  createdAt: true,
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
export type Recording = typeof recordings.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;
export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type SearchQuery = typeof searchQueries.$inferSelect;
export type InsertSearchQuery = z.infer<typeof insertSearchQuerySchema>;

// User onboarding progress and gamification
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  currentStep: integer("current_step").notNull().default(1),
  completedSteps: jsonb("completed_steps").notNull().default([]),
  totalPoints: integer("total_points").notNull().default(0),
  achievements: jsonb("achievements").notNull().default([]),
  tutorialCompleted: boolean("tutorial_completed").notNull().default(false),
  lastActiveStep: text("last_active_step"),
  onboardingStarted: timestamp("onboarding_started").defaultNow(),
  onboardingCompleted: timestamp("onboarding_completed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const onboardingSteps = pgTable("onboarding_steps", {
  id: serial("id").primaryKey(),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  targetPage: text("target_page").notNull(),
  targetElement: text("target_element"),
  instructions: text("instructions").notNull(),
  points: integer("points").notNull().default(10),
  isRequired: boolean("is_required").notNull().default(true),
  category: text("category").notNull(),
  estimatedTime: integer("estimated_time"), // in minutes
  videoUrl: text("video_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  points: integer("points").notNull(),
  category: text("category").notNull(),
  condition: jsonb("condition").notNull(), // JSON describing unlock condition
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOnboardingStepSchema = createInsertSchema(onboardingSteps).omit({
  id: true,
  createdAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type OnboardingStep = typeof onboardingSteps.$inferSelect;
export type InsertOnboardingStep = z.infer<typeof insertOnboardingStepSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

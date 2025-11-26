import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  avatar: text("avatar"),
  fullName: text("full_name").notNull(),
});

export const courses = pgTable("courses", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  instructor: text("instructor").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  thumbnail: text("thumbnail"),
  duration: text("duration"),
  progress: integer("progress").default(0),
  totalLessons: integer("total_lessons").default(0),
  completedLessons: integer("completed_lessons").default(0),
  status: text("status").notNull(),
});

export const assignments = pgTable("assignments", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  course: text("course").notNull(),
  dueDate: text("due_date").notNull(),
  status: text("status").notNull(),
  progress: integer("progress").default(0),
  priority: text("priority"),
});

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  course: text("course").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  type: text("type").notNull(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  timestamp: text("timestamp").notNull(),
  type: text("type").notNull(),
  course: text("course"),
});

export const learningActivity = pgTable("learning_activity", {
  id: varchar("id").primaryKey(),
  day: text("day").notNull(),
  uiDesign: integer("ui_design").default(0),
  frontEnd: integer("front_end").default(0),
  copywriting: integer("copywriting").default(0),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertCourseSchema = createInsertSchema(courses).omit({ id: true });
export const insertAssignmentSchema = createInsertSchema(assignments).omit({ id: true });
export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true });
export const insertLearningActivitySchema = createInsertSchema(learningActivity).omit({ id: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type LearningActivity = typeof learningActivity.$inferSelect;
export type InsertLearningActivity = z.infer<typeof insertLearningActivitySchema>;

export interface DashboardStats {
  activeTasks: number;
  completedTasks: number;
  totalScore: number;
  performance: number;
}

export interface ProgressData {
  category: string;
  percentage: number;
  color: string;
}

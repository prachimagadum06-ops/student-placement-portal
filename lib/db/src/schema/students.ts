import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  rollNumber: text("roll_number").notNull().unique(),
  department: text("department").notNull(),
  cgpa: real("cgpa").notNull().default(0),
  phone: text("phone"),
  resumeUrl: text("resume_url"),
  skills: text("skills").default(""),
  status: text("status").notNull().default("active"),
  tenthPercent: real("tenth_percent"),
  twelfthPercent: real("twelfth_percent"),
  placedCompany: text("placed_company"),
  placedPackage: real("placed_package"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;

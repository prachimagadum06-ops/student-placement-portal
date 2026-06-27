import { pgTable, text, serial, timestamp, integer, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { studentsTable } from "./students";
import { jobsTable } from "./jobs";

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => studentsTable.id, { onDelete: "cascade" }).notNull(),
  jobId: integer("job_id").references(() => jobsTable.id, { onDelete: "cascade" }).notNull(),
  status: text("status").notNull().default("applied"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  unique("unique_student_job").on(t.studentId, t.jobId),
]);

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;

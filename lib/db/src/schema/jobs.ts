import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  companyId: integer("company_id").references(() => companiesTable.id, { onDelete: "cascade" }).notNull(),
  description: text("description"),
  minCgpa: real("min_cgpa").notNull().default(0),
  package: real("package"),
  location: text("location"),
  status: text("status").notNull().default("active"),
  driveDate: text("drive_date").notNull(),
  eligibleDepartments: text("eligible_departments").default("ALL"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, createdAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;

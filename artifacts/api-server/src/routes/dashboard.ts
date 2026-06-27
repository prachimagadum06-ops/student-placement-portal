import { Router, type IRouter } from "express";
import { db, studentsTable, companiesTable, jobsTable, applicationsTable, notificationsTable } from "@workspace/db";
import { eq, sql, and, gte } from "drizzle-orm";
import { authenticate } from "../lib/auth";

const router: IRouter = Router();

router.get("/dashboard/stats", authenticate, async (_req, res): Promise<void> => {
  const [[{ totalStudents }], [{ totalCompanies }], [{ totalJobs }], [{ totalApplications }], [{ selectedStudents }]] =
    await Promise.all([
      db.select({ totalStudents: sql<number>`cast(count(*) as int)` }).from(studentsTable),
      db.select({ totalCompanies: sql<number>`cast(count(*) as int)` }).from(companiesTable),
      db.select({ totalJobs: sql<number>`cast(count(*) as int)` }).from(jobsTable),
      db.select({ totalApplications: sql<number>`cast(count(*) as int)` }).from(applicationsTable),
      db.select({ selectedStudents: sql<number>`cast(count(*) as int)` })
        .from(applicationsTable)
        .where(eq(applicationsTable.status, "selected")),
    ]);

  const placementPercentage = totalStudents > 0 ? (selectedStudents / totalStudents) * 100 : 0;

  const placedStudents = await db.select({ placedPackage: studentsTable.placedPackage })
    .from(studentsTable)
    .where(eq(studentsTable.status, "placed"));
  const avgPackage = placedStudents.length > 0
    ? placedStudents.reduce((sum, s) => sum + (s.placedPackage ?? 0), 0) / placedStudents.length
    : 0;

  const monthlyPlacements = await db
    .select({
      month: sql<string>`to_char(${applicationsTable.updatedAt}, 'Mon YYYY')`,
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(applicationsTable)
    .where(
      and(
        eq(applicationsTable.status, "selected"),
        gte(applicationsTable.updatedAt, new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000))
      )
    )
    .groupBy(sql`to_char(${applicationsTable.updatedAt}, 'Mon YYYY')`)
    .orderBy(sql`to_char(${applicationsTable.updatedAt}, 'Mon YYYY')`);

  res.json({
    totalStudents,
    totalCompanies,
    totalJobs,
    totalApplications,
    selectedStudents,
    placementPercentage: Math.round(placementPercentage * 10) / 10,
    avgPackage: Math.round(avgPackage * 100) / 100,
    monthlyPlacements,
  });
});

router.get("/dashboard/student", authenticate, async (req, res): Promise<void> => {
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.userId, req.user!.userId));
  if (!student) {
    res.status(404).json({ error: "Student profile not found" });
    return;
  }

  const applications = await db
    .select({
      id: applicationsTable.id,
      studentId: applicationsTable.studentId,
      jobId: applicationsTable.jobId,
      status: applicationsTable.status,
      notes: applicationsTable.notes,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .where(eq(applicationsTable.studentId, student.id))
    .orderBy(applicationsTable.createdAt);

  const allJobs = await db
    .select({
      id: jobsTable.id,
      title: jobsTable.title,
      companyId: jobsTable.companyId,
      companyName: companiesTable.name,
      description: jobsTable.description,
      minCgpa: jobsTable.minCgpa,
      package: jobsTable.package,
      location: jobsTable.location,
      status: jobsTable.status,
      driveDate: jobsTable.driveDate,
      eligibleDepartments: jobsTable.eligibleDepartments,
      createdAt: jobsTable.createdAt,
    })
    .from(jobsTable)
    .leftJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .where(eq(jobsTable.status, "active"));

  const appliedJobIds = new Set(applications.map(a => a.jobId));
  const eligibleJobs = allJobs.filter(j =>
    !appliedJobIds.has(j.id) && student.cgpa >= j.minCgpa
  );

  const notifications = await db
    .select()
    .from(notificationsTable)
    .orderBy(notificationsTable.createdAt);

  const recentNotifications = notifications
    .filter(n => !n.targetRole || n.targetRole === "student" || n.targetRole === "all")
    .slice(-10);

  res.json({
    student: { ...student, createdAt: student.createdAt.toISOString() },
    applications: applications.map(a => ({
      ...a,
      studentName: student.name,
      jobTitle: null,
      companyName: null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    eligibleJobs: eligibleJobs.map(j => ({
      ...j,
      companyName: j.companyName ?? "",
      createdAt: j.createdAt.toISOString(),
    })),
    recentNotifications: recentNotifications.map(n => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    })),
  });
});

export default router;

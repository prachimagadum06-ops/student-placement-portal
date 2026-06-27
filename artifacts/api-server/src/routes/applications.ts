import { Router, type IRouter } from "express";
import { db, applicationsTable, studentsTable, jobsTable, companiesTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin } from "../lib/auth";
import {
  ListApplicationsQueryParams,
  CreateApplicationBody,
  GetApplicationParams,
  UpdateApplicationStatusParams,
  UpdateApplicationStatusBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getApplicationFull(appId: number) {
  const result = await db
    .select({
      id: applicationsTable.id,
      studentId: applicationsTable.studentId,
      jobId: applicationsTable.jobId,
      studentName: studentsTable.name,
      jobTitle: jobsTable.title,
      companyName: companiesTable.name,
      status: applicationsTable.status,
      notes: applicationsTable.notes,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .leftJoin(studentsTable, eq(applicationsTable.studentId, studentsTable.id))
    .leftJoin(jobsTable, eq(applicationsTable.jobId, jobsTable.id))
    .leftJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .where(eq(applicationsTable.id, appId));
  return result[0];
}

router.get("/applications", authenticate, async (req, res): Promise<void> => {
  const parsed = ListApplicationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { jobId, studentId, status, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (req.user!.role === "student") {
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.userId, req.user!.userId));
    if (student) {
      conditions.push(eq(applicationsTable.studentId, student.id));
    }
  } else {
    if (jobId) conditions.push(eq(applicationsTable.jobId, jobId));
    if (studentId) conditions.push(eq(applicationsTable.studentId, studentId));
  }
  if (status) conditions.push(eq(applicationsTable.status, status));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(applicationsTable)
    .where(where);

  const applications = await db
    .select({
      id: applicationsTable.id,
      studentId: applicationsTable.studentId,
      jobId: applicationsTable.jobId,
      studentName: studentsTable.name,
      jobTitle: jobsTable.title,
      companyName: companiesTable.name,
      status: applicationsTable.status,
      notes: applicationsTable.notes,
      createdAt: applicationsTable.createdAt,
      updatedAt: applicationsTable.updatedAt,
    })
    .from(applicationsTable)
    .leftJoin(studentsTable, eq(applicationsTable.studentId, studentsTable.id))
    .leftJoin(jobsTable, eq(applicationsTable.jobId, jobsTable.id))
    .leftJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
    .where(where)
    .limit(limit)
    .offset(offset)
    .orderBy(applicationsTable.createdAt);

  res.json({
    applications: applications.map(a => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    total: count,
    page,
    limit,
  });
});

router.post("/applications", authenticate, async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.userId, req.user!.userId));
  if (!student) {
    res.status(404).json({ error: "Student profile not found" });
    return;
  }

  const [existing] = await db
    .select()
    .from(applicationsTable)
    .where(and(eq(applicationsTable.studentId, student.id), eq(applicationsTable.jobId, parsed.data.jobId)));
  if (existing) {
    res.status(400).json({ error: "Already applied to this job" });
    return;
  }

  const [app] = await db.insert(applicationsTable).values({
    studentId: student.id,
    jobId: parsed.data.jobId,
    status: "applied",
  }).returning();

  const full = await getApplicationFull(app.id);
  res.status(201).json({
    ...full,
    createdAt: full?.createdAt.toISOString(),
    updatedAt: full?.updatedAt.toISOString(),
  });
});

router.get("/applications/:id", authenticate, async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const app = await getApplicationFull(params.data.id);
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }
  res.json({ ...app, createdAt: app.createdAt.toISOString(), updatedAt: app.updatedAt.toISOString() });
});

router.patch("/applications/:id/status", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateApplicationStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateApplicationStatusBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [app] = await db
    .update(applicationsTable)
    .set({ status: parsed.data.status, notes: parsed.data.notes, updatedAt: new Date() })
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (parsed.data.status === "selected") {
    const job = await db.select().from(jobsTable).where(eq(jobsTable.id, app.jobId));
    const company = job[0]
      ? await db.select().from(companiesTable).where(eq(companiesTable.id, job[0].companyId))
      : [];
    await db.update(studentsTable).set({
      status: "placed",
      placedCompany: company[0]?.name ?? null,
      placedPackage: job[0]?.package ?? null,
    }).where(eq(studentsTable.id, app.studentId));
  }

  const full = await getApplicationFull(app.id);
  res.json({ ...full, createdAt: full?.createdAt.toISOString(), updatedAt: full?.updatedAt.toISOString() });
});

export default router;

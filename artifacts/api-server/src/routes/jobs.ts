import { Router, type IRouter } from "express";
import { db, jobsTable, companiesTable } from "@workspace/db";
import { eq, ilike, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin } from "../lib/auth";
import {
  ListJobsQueryParams,
  CreateJobBody,
  GetJobParams,
  UpdateJobParams,
  UpdateJobBody,
  DeleteJobParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getJobWithCompany(jobId: number) {
  const result = await db
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
    .where(eq(jobsTable.id, jobId));
  return result[0];
}

router.get("/jobs", authenticate, async (req, res): Promise<void> => {
  const parsed = ListJobsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, status, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) conditions.push(ilike(jobsTable.title, `%${search}%`));
  if (status) conditions.push(eq(jobsTable.status, status));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(jobsTable)
    .where(where);

  const jobs = await db
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
    .where(where)
    .limit(limit)
    .offset(offset)
    .orderBy(jobsTable.createdAt);

  res.json({
    jobs: jobs.map(j => ({
      ...j,
      companyName: j.companyName ?? "",
      createdAt: j.createdAt.toISOString(),
    })),
    total: count,
    page,
    limit,
  });
});

router.post("/jobs", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db.insert(jobsTable).values(parsed.data).returning();
  const full = await getJobWithCompany(job.id);
  res.status(201).json({ ...full, companyName: full?.companyName ?? "", createdAt: full?.createdAt.toISOString() });
});

router.get("/jobs/:id", authenticate, async (req, res): Promise<void> => {
  const params = GetJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const job = await getJobWithCompany(params.data.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.json({ ...job, companyName: job.companyName ?? "", createdAt: job.createdAt.toISOString() });
});

router.patch("/jobs/:id", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateJobBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [job] = await db
    .update(jobsTable)
    .set(parsed.data)
    .where(eq(jobsTable.id, params.data.id))
    .returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  const full = await getJobWithCompany(job.id);
  res.json({ ...full, companyName: full?.companyName ?? "", createdAt: full?.createdAt.toISOString() });
});

router.delete("/jobs/:id", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteJobParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [job] = await db.delete(jobsTable).where(eq(jobsTable.id, params.data.id)).returning();
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;

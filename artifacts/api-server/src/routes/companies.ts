import { Router, type IRouter } from "express";
import { db, companiesTable } from "@workspace/db";
import { eq, ilike, sql } from "drizzle-orm";
import { authenticate, requireAdmin } from "../lib/auth";
import {
  ListCompaniesQueryParams,
  CreateCompanyBody,
  GetCompanyParams,
  UpdateCompanyParams,
  UpdateCompanyBody,
  DeleteCompanyParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/companies", authenticate, async (req, res): Promise<void> => {
  const parsed = ListCompaniesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const where = search ? ilike(companiesTable.name, `%${search}%`) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(companiesTable)
    .where(where);

  const companies = await db
    .select()
    .from(companiesTable)
    .where(where)
    .limit(limit)
    .offset(offset)
    .orderBy(companiesTable.createdAt);

  res.json({
    companies: companies.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
    total: count,
    page,
    limit,
  });
});

router.post("/companies", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [company] = await db.insert(companiesTable).values(parsed.data).returning();
  res.status(201).json({ ...company, createdAt: company.createdAt.toISOString() });
});

router.get("/companies/:id", authenticate, async (req, res): Promise<void> => {
  const params = GetCompanyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, params.data.id));
  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }
  res.json({ ...company, createdAt: company.createdAt.toISOString() });
});

router.patch("/companies/:id", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCompanyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateCompanyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [company] = await db
    .update(companiesTable)
    .set(parsed.data)
    .where(eq(companiesTable.id, params.data.id))
    .returning();
  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }
  res.json({ ...company, createdAt: company.createdAt.toISOString() });
});

router.delete("/companies/:id", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCompanyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [company] = await db.delete(companiesTable).where(eq(companiesTable.id, params.data.id)).returning();
  if (!company) {
    res.status(404).json({ error: "Company not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;

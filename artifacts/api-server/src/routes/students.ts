import { Router, type IRouter } from "express";
import { db, studentsTable, usersTable } from "@workspace/db";
import { eq, ilike, or, sql, and } from "drizzle-orm";
import { authenticate, requireAdmin } from "../lib/auth";
import {
  ListStudentsQueryParams,
  CreateStudentBody,
  GetStudentParams,
  UpdateStudentParams,
  UpdateStudentBody,
  DeleteStudentParams,
} from "@workspace/api-zod";
import bcrypt from "bcryptjs";

const router: IRouter = Router();

router.get("/students", authenticate, async (req, res): Promise<void> => {
  const parsed = ListStudentsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { search, department, page = 1, limit = 20 } = parsed.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (search) {
    conditions.push(
      or(
        ilike(studentsTable.name, `%${search}%`),
        ilike(studentsTable.email, `%${search}%`),
        ilike(studentsTable.rollNumber, `%${search}%`)
      )
    );
  }
  if (department) {
    conditions.push(eq(studentsTable.department, department));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(studentsTable)
    .where(where);

  const students = await db
    .select()
    .from(studentsTable)
    .where(where)
    .limit(limit)
    .offset(offset)
    .orderBy(studentsTable.createdAt);

  res.json({
    students: students.map(s => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
    total: count,
    page,
    limit,
  });
});

router.post("/students", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;

  const [existingStudent] = await db.select().from(studentsTable).where(eq(studentsTable.email, data.email));
  if (existingStudent) {
    res.status(400).json({ error: "Student with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash("password123", 10);
  const [user] = await db.insert(usersTable).values({
    email: data.email,
    passwordHash,
    role: "student",
  }).returning();

  const [student] = await db.insert(studentsTable).values({
    userId: user.id,
    ...data,
    status: "active",
  }).returning();

  res.status(201).json({ ...student, createdAt: student.createdAt.toISOString() });
});

router.get("/students/:id", authenticate, async (req, res): Promise<void> => {
  const params = GetStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.id, params.data.id));
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json({ ...student, createdAt: student.createdAt.toISOString() });
});

router.patch("/students/:id", authenticate, async (req, res): Promise<void> => {
  const params = UpdateStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateStudentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [student] = await db
    .update(studentsTable)
    .set(parsed.data)
    .where(eq(studentsTable.id, params.data.id))
    .returning();

  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.json({ ...student, createdAt: student.createdAt.toISOString() });
});

router.delete("/students/:id", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteStudentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [student] = await db.delete(studentsTable).where(eq(studentsTable.id, params.data.id)).returning();
  if (!student) {
    res.status(404).json({ error: "Student not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;

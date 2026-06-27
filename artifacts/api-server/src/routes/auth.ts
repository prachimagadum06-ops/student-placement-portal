import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, studentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, authenticate } from "../lib/auth";
import {
  RegisterBody,
  LoginBody,
  ChangePasswordBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password, name } = parsed.data;

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({ email, passwordHash, role: "student" }).returning();

  const rollNumber = `STU${String(user.id).padStart(6, "0")}`;
  await db.insert(studentsTable).values({
    userId: user.id,
    name,
    email,
    rollNumber,
    department: "General",
    cgpa: 0,
    status: "active",
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.status(201).json({
    token,
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
  });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() },
  });
});

router.get("/auth/me", authenticate, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt.toISOString() });
});

router.post("/auth/change-password", authenticate, async (req, res): Promise<void> => {
  const parsed = ChangePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { currentPassword, newPassword } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, user.id));
  res.json({ message: "Password changed successfully" });
});

export default router;

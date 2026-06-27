import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireAdmin } from "../lib/auth";
import {
  CreateNotificationBody,
  MarkNotificationReadParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/notifications", authenticate, async (req, res): Promise<void> => {
  const role = req.user!.role;
  const allNotifications = await db
    .select()
    .from(notificationsTable)
    .orderBy(notificationsTable.createdAt);

  const filtered = allNotifications.filter(n =>
    !n.targetRole || n.targetRole === role || n.targetRole === "all"
  );

  res.json(filtered.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })));
});

router.post("/notifications", authenticate, requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateNotificationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [notification] = await db.insert(notificationsTable).values(parsed.data).returning();
  res.status(201).json({ ...notification, createdAt: notification.createdAt.toISOString() });
});

router.patch("/notifications/:id/read", authenticate, async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(eq(notificationsTable.id, params.data.id))
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json({ ...notification, createdAt: notification.createdAt.toISOString() });
});

export default router;

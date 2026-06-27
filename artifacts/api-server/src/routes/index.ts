import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import studentsRouter from "./students";
import companiesRouter from "./companies";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(studentsRouter);
router.use(companiesRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);

export default router;

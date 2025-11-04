import { Router } from "express";
import authRoutes from "./auth.routes.js";
import crewRouter from "./crew.routes.js";
import taskRouter from "./task.routes.js";
import reportRouter from "./report.route.js";
import progressReportRouter from "./progress_report.routes.js";

const router = Router();

router.use(authRoutes);
router.use(crewRouter);
router.use(taskRouter);
router.use(reportRouter);

router.use("/progress-report", progressReportRouter);

export default router;

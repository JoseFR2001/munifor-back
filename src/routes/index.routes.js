import { Router } from "express";
import authRoutes from "./auth.routes.js";
import crewRouter from "./crew.routes.js";
import taskRouter from "./task.routes.js";
import reportRouter from "./report.route.js";
import progressReportRouter from "./progress_report.routes.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import dashboardRouter from "./dashboard.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

// Rutas públicas (sin middleware)
router.use(authRoutes);

// Rutas protegidas (con middleware)
router.use(authMiddleware);
router.use(crewRouter);
router.use(taskRouter);
router.use(reportRouter);
router.use(progressReportRouter);
router.use(userRoutes);
router.use(dashboardRouter);

export default router;

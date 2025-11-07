import { Router } from "express";
import {
  getAdminDashboard,
  getDashboardCitizen,
  getDashboardWorker,
  getOperatorDashboard,
} from "../controllers/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard/citizens", getDashboardCitizen);
dashboardRouter.get("/dashboard/workers", getDashboardWorker);
dashboardRouter.get("/dashboard/operators", getOperatorDashboard);
dashboardRouter.get("/dashboard/admin", getAdminDashboard);

export default dashboardRouter;

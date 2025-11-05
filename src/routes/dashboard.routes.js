import { Router } from "express";
import { getReportCitizenCounts } from "../controllers/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard/citizens", getReportCitizenCounts);

export default dashboardRouter;

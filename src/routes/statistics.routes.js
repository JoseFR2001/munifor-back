import { Router } from "express";
import { getAdminStatistics } from "../controllers/statistics.controller.js";

const statisticsRoutes = Router();

statisticsRoutes.get("/admin/statistics", getAdminStatistics);

export default statisticsRoutes;

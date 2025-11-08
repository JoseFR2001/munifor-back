import { Router } from "express";
import {
  getAdminStatistics,
  getOperatorStatistics,
} from "../controllers/statistics.controller.js";

const statisticsRoutes = Router();

statisticsRoutes.get("/operator/statistics", getOperatorStatistics);
statisticsRoutes.get("/admin/statistics", getAdminStatistics);

export default statisticsRoutes;

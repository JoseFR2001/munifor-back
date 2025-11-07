import { Router } from "express";
import {
  getChartBar,
  getChartDoughnut,
  getChartLineReportsPerYear,
  getChartLineReportTypes,
} from "../controllers/statistics.controller.js";

const statisticsRoutes = Router();

statisticsRoutes.get("/charts/bar", getChartBar);
statisticsRoutes.get("/charts/doughnut", getChartDoughnut);
statisticsRoutes.get("/charts/line/reports", getChartLineReportsPerYear);
statisticsRoutes.get("/charts/line/report-types", getChartLineReportTypes);

export default statisticsRoutes;

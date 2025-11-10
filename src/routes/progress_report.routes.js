import { Router } from "express";
import {
  createProgressReport,
  getAllProgressReports,
  getProgressReportById,
  updateProgressReport,
  deleteProgressReport,
  getProgressByLeader,
} from "../controllers/progress_report.controller.js";
import { uploadProgressImages } from "../config/multer.js";

const routerProgress = Router();

routerProgress.post(
  "/progress-report",
  uploadProgressImages,
  createProgressReport
);
routerProgress.get("/progress-report", getAllProgressReports);
routerProgress.get("/progress-report/leader", getProgressByLeader);
routerProgress.get("/progress-report/:id", getProgressReportById);
routerProgress.put(
  "/progress-report/:id",
  uploadProgressImages,
  updateProgressReport
);
routerProgress.delete("/progress-report/:id", deleteProgressReport);

export default routerProgress;

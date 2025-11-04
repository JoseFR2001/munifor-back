import { Router } from "express";
import {
  createProgressReport,
  getAllProgressReports,
  getProgressReportById,
  updateProgressReport,
  deleteProgressReport,
} from "../controllers/progress_report.controller.js";

const router = Router();

router.post("/progress-report", createProgressReport);
router.get("/progress-report", getAllProgressReports);
router.get("/progress-report/:id", getProgressReportById);
router.put("/progress-report/:id", updateProgressReport);
router.delete("/progress-report/:id", deleteProgressReport);

export default router;

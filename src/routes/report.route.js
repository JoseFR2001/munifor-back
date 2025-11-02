import { Router } from "express";
import {
  createReport,
  deleteReport,
  getAllReports,
  getReportById,
  updateReport,
} from "../controllers/report.controller.js";

const reportRouter = Router();

reportRouter.post("/report", createReport);
reportRouter.get("/report", getAllReports);
reportRouter.get("/report/:id", getReportById);
reportRouter.put("/report/:id", updateReport);
reportRouter.delete("/report/:id", deleteReport);

export default reportRouter;

import { Router } from "express";
import {
  createReport,
  deleteReport,
  getAllReports,
  getAllReportsForAuthor,
  getReportById,
  updateReport,
} from "../controllers/report.controller.js";

const reportRouter = Router();

reportRouter.post("/report", createReport);
reportRouter.get("/reports", getAllReports);
reportRouter.get("/reports/author/:id", getAllReportsForAuthor);
reportRouter.get("/report/:id", getReportById);
reportRouter.put("/report/:id", updateReport);
reportRouter.delete("/report/:id", deleteReport);

export default reportRouter;

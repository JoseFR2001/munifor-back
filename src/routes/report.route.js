import { Router } from "express";
import {
  acceptReport,
  completeReport,
  createReport,
  deleteReport,
  getAllReports,
  getAllReportsForAuthor,
  getNewReports,
  getReportById,
  getReportsByOperator,
  getReportsOperatorAccepted,
  getReportsPending,
  rejectReport,
  reviewReport,
  updateReport,
} from "../controllers/report.controller.js";
import { uploadReportImages } from "../config/multer.js";

const reportRouter = Router();

// * Rutas para crear reporte (con imágenes)
reportRouter.post("/report", uploadReportImages, createReport);

// * Ruta para los reportes que tiene un operador asignado
reportRouter.get("/report/operator", getReportsByOperator);
reportRouter.get("/reports/operator/accepted", getReportsOperatorAccepted);

// * Rutas para obtener reportes
reportRouter.get("/reports", getAllReports);
reportRouter.get("/reports/pending", getReportsPending);
reportRouter.get("/reports/author", getAllReportsForAuthor);
reportRouter.get("/report/:id", getReportById);
reportRouter.get("/report/operator/new-reports", getNewReports);

// * Ruta para actualizar el estado de un reporte
reportRouter.put("/report/review/:id", reviewReport);
reportRouter.put("/report/accept/:id", acceptReport);
reportRouter.put("/report/complete/:id", completeReport);
reportRouter.put("/report/reject/:id", rejectReport);

// * Rutas para actualizar y eliminar reportes (con imágenes opcionales)
reportRouter.put("/report/:id", uploadReportImages, updateReport);
reportRouter.delete("/report/:id", deleteReport);

export default reportRouter;

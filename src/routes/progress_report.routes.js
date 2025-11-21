//* ============================================
//* RUTAS DE REPORTES DE PROGRESO
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express";

//! IMPORTS DE CONTROLADORES
import {
  createProgressReport,
  getAllProgressReports,
  getProgressReportById,
  updateProgressReport,
  deleteProgressReport,
  getProgressByLeader,
} from "../controllers/progress_report.controller.js";

//! IMPORTS DE MIDDLEWARES (MULTER)
import { uploadProgressImages } from "../config/multer.js";

//* CREACIÓN DEL ROUTER
const routerProgress = Router();

//* ============================================
//* DEFINICIÓN DE RUTAS
//* ============================================

//? POST /api/progress-report - Crear reporte de progreso (con imágenes)
// El líder de la cuadrilla reporta el avance de una tarea
// Middleware uploadProgressImages permite hasta 5 imágenes
// Body (multipart/form-data): { task, description, status, images[] }
// Responde: { ok, progressReport }
//! IMPORTANTE: Si status="Finalizado" activa CASCADE de auto-completado
routerProgress.post(
  "/progress-report",
  uploadProgressImages,
  createProgressReport
);

//? GET /api/progress-report - Obtener todos los reportes de progreso
// Para administradores/operadores
// Responde: { ok, progressReports[] }
routerProgress.get("/progress-report", getAllProgressReports);

//? GET /api/progress-report/leader - Obtener reportes del líder logueado
// Usa req.user._id para filtrar reportes creados por el líder
// Responde: { ok, progressReports[] }
routerProgress.get("/progress-report/leader", getProgressByLeader);

//? GET /api/progress-report/:id - Obtener reporte de progreso por ID
// Params: id
// Responde: { ok, progressReport }
routerProgress.get("/progress-report/:id", getProgressReportById);

//? PUT /api/progress-report/:id - Actualizar reporte de progreso (con imágenes)
// Params: id
// Body (multipart/form-data): { description?, status?, images[]? }
// Middleware uploadProgressImages permite actualizar imágenes
// Responde: { ok, progressReport }
//! IMPORTANTE: Si status cambia a "Finalizado" activa CASCADE de auto-completado
routerProgress.put(
  "/progress-report/:id",
  uploadProgressImages,
  updateProgressReport
);

//? DELETE /api/progress-report/:id - Eliminar reporte de progreso (soft delete)
// Params: id
// Marca deleted_at con fecha actual
// Responde: { ok, msg }
routerProgress.delete("/progress-report/:id", deleteProgressReport);

//* EXPORTAR EL ROUTER
export default routerProgress;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// routerProgress = enrutador de reportes de progreso
// createProgressReport = crear reporte de progreso
// getAllProgressReports = obtener todos los reportes de progreso
// getProgressByLeader = obtener reportes de progreso por líder
// getProgressReportById = obtener reporte de progreso por ID
// updateProgressReport = actualizar reporte de progreso
// deleteProgressReport = eliminar reporte de progreso
// uploadProgressImages = middleware de Multer para subir imágenes de progreso
// leader = líder de cuadrilla
// CASCADE = efecto en cascada (auto-completado de Task y Reports)

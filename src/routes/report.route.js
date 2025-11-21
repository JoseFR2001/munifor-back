//* ============================================
//* RUTAS DE REPORTES (DENUNCIAS CIUDADANAS)
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express";

//! IMPORTS DE CONTROLADORES
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

//! IMPORTS DE MIDDLEWARES (MULTER)
import { uploadReportImages } from "../config/multer.js";

//* CREACIÓN DEL ROUTER
const reportRouter = Router();

//* ============================================
//* RUTAS DE CREACIÓN
//* ============================================

//? POST /api/report - Crear reporte ciudadano (con imágenes)
// Ciudadano reporta un problema (bache, luminaria, etc.)
// Middleware uploadReportImages permite hasta 5 imágenes
// Body (multipart/form-data): { title, description, location, report_type, images[] }
// Responde: { ok, report }
reportRouter.post("/report", uploadReportImages, createReport);

//* ============================================
//* RUTAS DE CONSULTA - OPERADOR
//* ============================================

//? GET /api/report/operator - Obtener reportes asignados al operador
// Usa req.user._id para filtrar reportes con assigned_operator
// Responde: { ok, reports[] }
reportRouter.get("/report/operator", getReportsByOperator);

//? GET /api/reports/operator/accepted - Obtener reportes aceptados por el operador
// Filtra reportes con status: "Aceptado" y assigned_operator: req.user._id
// Responde: { ok, reports[] }
reportRouter.get("/reports/operator/accepted", getReportsOperatorAccepted);

//? GET /api/report/operator/new-reports - Obtener reportes nuevos para el operador
// Filtra reportes con status: "Nuevo" y assigned_operator: req.user._id
// Para que el operador vea reportes recién asignados
// Responde: { ok, reports[] }
reportRouter.get("/report/operator/new-reports", getNewReports);

//* ============================================
//* RUTAS DE CONSULTA - GENERAL
//* ============================================

//? GET /api/reports - Obtener todos los reportes
// Para administradores
// Responde: { ok, reports[] }
reportRouter.get("/reports", getAllReports);

//? GET /api/reports/pending - Obtener reportes pendientes
// Filtra reportes con status: "Pendiente"
// Para que operadores vean reportes sin asignar
// Responde: { ok, reports[] }
reportRouter.get("/reports/pending", getReportsPending);

//? GET /api/reports/author - Obtener reportes del ciudadano logueado
// Usa req.user._id para filtrar reportes creados por el autor
// Responde: { ok, reports[] }
reportRouter.get("/reports/author", getAllReportsForAuthor);

//? GET /api/report/:id - Obtener reporte por ID
// Params: id
// Responde: { ok, report }
reportRouter.get("/report/:id", getReportById);

//* ============================================
//* RUTAS DE CAMBIO DE ESTADO
//* ============================================

//? PUT /api/report/review/:id - Cambiar estado a "En Revisión"
// El operador comienza a revisar el reporte
// Params: id
// Responde: { ok, msg, report }
reportRouter.put("/report/review/:id", reviewReport);

//? PUT /api/report/accept/:id - Aceptar reporte
// Cambia status a "Aceptado"
// El operador acepta el reporte y puede crear tarea
// Params: id
// Responde: { ok, msg, report }
reportRouter.put("/report/accept/:id", acceptReport);

//? PUT /api/report/complete/:id - Completar reporte
// Cambia status a "Completado"
// Marca el reporte como resuelto
// Params: id
// Responde: { ok, msg, report }
reportRouter.put("/report/complete/:id", completeReport);

//? PUT /api/report/reject/:id - Rechazar reporte
// Cambia status a "Rechazado"
// El operador rechaza el reporte (duplicado, inválido, etc.)
// Params: id
// Body: { rejection_reason }
// Responde: { ok, msg, report }
reportRouter.put("/report/reject/:id", rejectReport);

//* ============================================
//* RUTAS DE ACTUALIZACIÓN Y ELIMINACIÓN
//* ============================================

//? PUT /api/report/:id - Actualizar reporte (con imágenes opcionales)
// Params: id
// Body (multipart/form-data): { title?, description?, location?, images[]? }
// Middleware uploadReportImages permite actualizar imágenes
// Responde: { ok, report }
reportRouter.put("/report/:id", uploadReportImages, updateReport);

//? DELETE /api/report/:id - Eliminar reporte (soft delete)
// Params: id
// Marca deleted_at con fecha actual
// Responde: { ok, msg }
reportRouter.delete("/report/:id", deleteReport);

//* EXPORTAR EL ROUTER
export default reportRouter;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// reportRouter = enrutador de reportes
// createReport = crear reporte
// getReportsByOperator = obtener reportes por operador
// getReportsOperatorAccepted = obtener reportes aceptados por operador
// getNewReports = obtener reportes nuevos
// getAllReports = obtener todos los reportes
// getReportsPending = obtener reportes pendientes
// getAllReportsForAuthor = obtener todos los reportes del autor
// getReportById = obtener reporte por ID
// reviewReport = revisar reporte (cambiar estado a "En Revisión")
// acceptReport = aceptar reporte
// completeReport = completar reporte
// rejectReport = rechazar reporte
// updateReport = actualizar reporte
// deleteReport = eliminar reporte
// uploadReportImages = middleware de Multer para subir imágenes de reporte
// assigned_operator = operador asignado
// author = autor (ciudadano que creó el reporte)
// rejection_reason = razón de rechazo

//* ============================================
//* RUTAS DE DASHBOARD (TABLEROS)
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express";

//! IMPORTS DE CONTROLADORES
import {
  getAdminDashboard,
  getDashboardCitizen,
  getDashboardWorker,
  getOperatorDashboard,
} from "../controllers/dashboard.controller.js";

//* CREACIÓN DEL ROUTER
const dashboardRouter = Router();

//* ============================================
//* DEFINICIÓN DE RUTAS - DASHBOARDS POR ROL
//* ============================================

//? GET /api/dashboard/citizens - Dashboard para ciudadanos
// Muestra estadísticas de reportes del usuario logueado
// Reportes creados, en progreso, completados, rechazados
// Responde: { ok, stats }
dashboardRouter.get("/dashboard/citizens", getDashboardCitizen);

//? GET /api/dashboard/workers - Dashboard para trabajadores
// Muestra estadísticas de tareas asignadas a su cuadrilla
// Tareas pendientes, en progreso, completadas
// Responde: { ok, stats }
dashboardRouter.get("/dashboard/workers", getDashboardWorker);

//? GET /api/dashboard/operators - Dashboard para operadores
// Muestra estadísticas de reportes y tareas del operador
// Reportes aceptados, tareas creadas, reportes nuevos
// Responde: { ok, stats }
dashboardRouter.get("/dashboard/operators", getOperatorDashboard);

//? GET /api/dashboard/admin - Dashboard para administradores
// Muestra estadísticas generales del sistema
// Total de reportes, tareas, usuarios, cuadrillas
// Responde: { ok, stats }
dashboardRouter.get("/dashboard/admin", getAdminDashboard);

//* EXPORTAR EL ROUTER
export default dashboardRouter;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// dashboardRouter = enrutador de tableros/dashboards
// getDashboardCitizen = obtener dashboard de ciudadano
// getDashboardWorker = obtener dashboard de trabajador
// getOperatorDashboard = obtener dashboard de operador
// getAdminDashboard = obtener dashboard de administrador
// dashboard = tablero de control/panel de estadísticas
// stats = estadísticas

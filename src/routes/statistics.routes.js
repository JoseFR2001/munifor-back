//* ============================================
//* RUTAS DE ESTADÍSTICAS (GRÁFICOS)
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express";

//! IMPORTS DE CONTROLADORES
import {
  getAdminStatistics,
  getOperatorStatistics,
} from "../controllers/statistics.controller.js";

//* CREACIÓN DEL ROUTER
const statisticsRoutes = Router();

//* ============================================
//* DEFINICIÓN DE RUTAS - ESTADÍSTICAS AVANZADAS
//* ============================================

//? GET /api/operator/statistics - Estadísticas del operador (gráficos)
// Usa req.user._id para filtrar reportes y tareas del operador
// Retorna datos para gráficos: bar chart, doughnut chart, line chart
// Agregaciones por estado, tipo, fecha
// Responde: { ok, barChart, doughnutChart, lineChart }
statisticsRoutes.get("/operator/statistics", getOperatorStatistics);

//? GET /api/admin/statistics - Estadísticas del admin (gráficos globales)
// Estadísticas de TODO el sistema
// Retorna datos para gráficos: bar chart, doughnut chart, line chart
// Agregaciones por estado, tipo, fecha de todos los reportes
// Responde: { ok, barChart, doughnutChart, lineChart }
statisticsRoutes.get("/admin/statistics", getAdminStatistics);

//* EXPORTAR EL ROUTER
export default statisticsRoutes;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// statisticsRoutes = enrutador de estadísticas
// getOperatorStatistics = obtener estadísticas del operador
// getAdminStatistics = obtener estadísticas del administrador
// statistics = estadísticas
// barChart = gráfico de barras
// doughnutChart = gráfico de dona/circular
// lineChart = gráfico de líneas
// aggregations = agregaciones (operaciones de MongoDB para agrupar datos)

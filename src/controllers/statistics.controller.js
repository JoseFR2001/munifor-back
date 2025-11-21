//* ============================================
//* CONTROLADOR DE ESTADÍSTICAS (GRÁFICOS)
//* ============================================
//? Este controlador proporciona datos para gráficos avanzados usando agregaciones de MongoDB
//? Incluye estadísticas para administradores (todo el sistema) y operadores (solo sus reportes)

//! IMPORTS DE MODELOS
import { Types } from "mongoose";
import ReportModel from "../models/report.model.js";
import UserModel from "../models/user.model.js";
import mongoose from "mongoose";

//* ============================================
//* CONSTANTES
//* ============================================

//? Array de nombres de meses en español (para gráficos de línea)
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

//? Tipos de reportes disponibles en el sistema
const TIPOS_REPORTE = ["Bache", "Alumbrado", "Basura", "Otro"];

//* ============================================
//* ENDPOINTS PRINCIPALES
//* ============================================

/**
 * Obtiene estadísticas para el Operador
 * @description Solo muestra datos de reportes asignados a este operador
 * @route GET /api/operator/statistics
 * @access Operadores autenticados
 */
export const getOperatorStatistics = async (req, res) => {
  try {
    // const operatorId = req.user._id;
    const operatorId = new mongoose.Types.ObjectId(req.user._id); //? ID del operador logueado como ObjectId

    //? Obtener año de los query params, o usar año actual
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    //? Función auxiliar interna: Obtener datos de gráfico de dona
    const getChartDoughnutData = async () => {
      const pendingCount = 0; //! Los pendientes NO se cuentan
      const viewCount = await ReportModel.countDocuments({
        status: "Revisado",
        assigned_operator: operatorId,
      });
      const acceptedCount = await ReportModel.countDocuments({
        status: "Aceptado",
        assigned_operator: operatorId,
      });
      const completeCount = await ReportModel.countDocuments({
        status: "Completado",
        assigned_operator: operatorId,
      });
      const rejectCount = await ReportModel.countDocuments({
        status: "Rechazado",
        assigned_operator: operatorId,
      });

      return {
        Pendiente: pendingCount,
        Revisado: viewCount,
        Aceptado: acceptedCount,
        Completado: completeCount,
        Rechazado: rejectCount,
      };
    };

    //? Función auxiliar interna: Obtener datos de reportes por mes
    const getChartLineReportsData = async () => {
      const acceptedByMonth = await ReportModel.aggregate([
        {
          $match: {
            status: "Aceptado",
            approved_at: {
              $ne: null,
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31T23:59:59`),
            },
            assigned_operator: operatorId,
          },
        },
        { $group: { _id: { $month: "$approved_at" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const completedByMonth = await ReportModel.aggregate([
        {
          $match: {
            status: "Completado",
            completed_at: {
              $ne: null,
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31T23:59:59`),
            },
            assigned_operator: operatorId,
          },
        },
        { $group: { _id: { $month: "$completed_at" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const monthsAccepted = Array(12).fill(0);
      const monthsCompleted = Array(12).fill(0);

      acceptedByMonth.forEach((item) => {
        monthsAccepted[item._id - 1] = item.count;
      });

      completedByMonth.forEach((item) => {
        monthsCompleted[item._id - 1] = item.count;
      });

      return {
        year,
        months: MESES,
        Aceptado: monthsAccepted,
        Completado: monthsCompleted,
      };
    };

    //? Función auxiliar interna: Obtener datos de reportes por tipo
    const getChartLineReportTypesData = async () => {
      const chartLineReportTypesData = {
        year,
        months: MESES,
      };

      for (const reportType of TIPOS_REPORTE) {
        const dataByMonth = await ReportModel.aggregate([
          {
            $match: {
              type_report: reportType,
              //! Usar approved_at en lugar de created_at para que coincida con cuando fue asignado
              approved_at: {
                $ne: null,
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31T23:59:59`),
              },
              assigned_operator: operatorId,
            },
          },
          { $group: { _id: { $month: "$approved_at" }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]);

        const monthsData = Array(12).fill(0);

        dataByMonth.forEach((item) => {
          monthsData[item._id - 1] = item.count;
        });

        chartLineReportTypesData[reportType] = monthsData;
      }

      return chartLineReportTypesData;
    };

    //? Obtener todos los datos usando las funciones internas
    const chartDoughnutData = await getChartDoughnutData();
    const chartLineReportsData = await getChartLineReportsData();
    const chartLineReportTypesData = await getChartLineReportTypesData();

    return res.status(200).json({
      ok: true,
      data: {
        chartDoughnutData, //? Reportes por estado
        chartLineReportsData, //? Reportes aceptados/completados por mes
        chartLineReportTypesData, //? Reportes por tipo por mes
      },
    });
  } catch (error) {
    console.error("Error en getOperatorStatistics:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

/**
 * Obtiene estadísticas para el Administrador
 * @description Muestra datos de TODOS los reportes del sistema
 * @route GET /api/admin/statistics
 * @access Administradores autenticados
 */
export const getAdminStatistics = async (req, res) => {
  try {
    //? Obtener año de los query params, o usar año actual
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    //? Función auxiliar interna: Obtener datos de usuarios por rol
    const getChartBarData = async () => {
      const citizenCount = await UserModel.countDocuments({
        role: "Ciudadano",
      });
      const operatorCount = await UserModel.countDocuments({
        role: "Operador",
      });
      const workerCount = await UserModel.countDocuments({
        role: "Trabajador",
      });
      const adminCount = await UserModel.countDocuments({
        role: "Administrador",
      });

      return {
        Ciudadano: citizenCount,
        Operador: operatorCount,
        Trabajador: workerCount,
        Administrador: adminCount,
      };
    };

    //? Función auxiliar interna: Obtener datos de gráfico de dona
    const getChartDoughnutData = async () => {
      const pendingCount = await ReportModel.countDocuments({
        status: "Pendiente",
      });
      const viewCount = await ReportModel.countDocuments({
        status: "Revisado",
      });
      const acceptedCount = await ReportModel.countDocuments({
        status: "Aceptado",
      });
      const completeCount = await ReportModel.countDocuments({
        status: "Completado",
      });
      const rejectCount = await ReportModel.countDocuments({
        status: "Rechazado",
      });

      return {
        Pendiente: pendingCount,
        Revisado: viewCount,
        Aceptado: acceptedCount,
        Completado: completeCount,
        Rechazado: rejectCount,
      };
    };

    //? Función auxiliar interna: Obtener datos de reportes por mes
    const getChartLineReportsData = async () => {
      const acceptedByMonth = await ReportModel.aggregate([
        {
          $match: {
            status: "Aceptado",
            approved_at: {
              $ne: null,
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31T23:59:59`),
            },
          },
        },
        { $group: { _id: { $month: "$approved_at" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const completedByMonth = await ReportModel.aggregate([
        {
          $match: {
            status: "Completado",
            completed_at: {
              $ne: null,
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31T23:59:59`),
            },
          },
        },
        { $group: { _id: { $month: "$completed_at" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      const monthsAccepted = Array(12).fill(0);
      const monthsCompleted = Array(12).fill(0);

      acceptedByMonth.forEach((item) => {
        monthsAccepted[item._id - 1] = item.count;
      });

      completedByMonth.forEach((item) => {
        monthsCompleted[item._id - 1] = item.count;
      });

      return {
        year,
        months: MESES,
        Aceptado: monthsAccepted,
        Completado: monthsCompleted,
      };
    };

    //? Función auxiliar interna: Obtener datos de reportes por tipo
    const getChartLineReportTypesData = async () => {
      const chartLineReportTypesData = {
        year,
        months: MESES,
      };

      for (const reportType of TIPOS_REPORTE) {
        const dataByMonth = await ReportModel.aggregate([
          {
            $match: {
              type_report: reportType,
              created_at: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31T23:59:59`),
              },
            },
          },
          { $group: { _id: { $month: "$created_at" }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]);

        const monthsData = Array(12).fill(0);

        dataByMonth.forEach((item) => {
          monthsData[item._id - 1] = item.count;
        });

        chartLineReportTypesData[reportType] = monthsData;
      }

      return chartLineReportTypesData;
    };

    //? Obtener todos los datos usando las funciones internas
    const chartBarData = await getChartBarData();
    const chartDoughnutData = await getChartDoughnutData();
    const chartLineReportsData = await getChartLineReportsData();
    const chartLineReportTypesData = await getChartLineReportTypesData();

    return res.status(200).json({
      ok: true,
      data: {
        chartBarData, //? Gráfico de barras: usuarios por rol
        chartDoughnutData, //? Gráfico de dona: reportes por estado
        chartLineReportsData, //? Gráfico de líneas: reportes aceptados/completados por mes
        chartLineReportTypesData, //? Gráfico de líneas: reportes por tipo por mes
      },
    });
  } catch (error) {
    console.error("Error en getAdminStatistics:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// getOperatorStatistics = obtener estadísticas del operador
// getAdminStatistics = obtener estadísticas del administrador
// MESES = array de nombres de meses en español
// TIPOS_REPORTE = tipos de reportes del sistema
// getChartBarData = obtener datos para gráfico de barras
// getChartDoughnutData = obtener datos para gráfico de dona
// getChartLineReportsPerYearData = obtener datos de reportes por año para gráfico de líneas
// getChartLineReportTypesData = obtener datos de tipos de reportes para gráfico de líneas
// aggregate = agregación (operación de MongoDB para agrupar y transformar datos)
// $match = filtrar documentos
// $group = agrupar documentos
// $month = extraer mes de una fecha
// $sum = sumar valores
// $sort = ordenar resultados
// $ne = no es igual (not equal)
// $gte = mayor o igual que (greater than or equal)
// $lte = menor o igual que (less than or equal)
// assigned_operator = operador asignado
// approved_at = fecha de aprobación
// completed_at = fecha de completado
// created_at = fecha de creación
// Array.fill(0) = llenar array con ceros
// chartBarData = datos para gráfico de barras
// chartDoughnutData = datos para gráfico de dona
// chartLineReportsData = datos para gráfico de líneas de reportes
// chartLineReportTypesData = datos para gráfico de líneas de tipos de reportes

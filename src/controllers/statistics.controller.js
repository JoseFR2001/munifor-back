import ReportModel from "../models/report.model.js";
import UserModel from "../models/user.model.js";

// ============================================
// CONSTANTES
// ============================================
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

const TIPOS_REPORTE = ["Bache", "Alumbrado", "Basura", "Otro"];

// ============================================
// FUNCIONES AUXILIARES PARA ADMIN
// ============================================

// Obtiene conteo de usuarios por rol
const getChartBarData = async () => {
  const citizenCount = await UserModel.countDocuments({ role: "Ciudadano" });
  const operatorCount = await UserModel.countDocuments({ role: "Operador" });
  const workerCount = await UserModel.countDocuments({ role: "Trabajador" });
  const adminCount = await UserModel.countDocuments({ role: "Administrador" });

  return {
    Ciudadano: citizenCount,
    Operador: operatorCount,
    Trabajador: workerCount,
    Administrador: adminCount,
  };
};

// Obtiene conteo de reportes por estado (TODOS los reportes del sistema)
const getChartDoughnutData = async () => {
  const pendingCount = await ReportModel.countDocuments({
    status: "Pendiente",
  });
  const viewCount = await ReportModel.countDocuments({ status: "Revisado" });
  const acceptedCount = await ReportModel.countDocuments({
    status: "Aceptado",
  });
  const completeCount = await ReportModel.countDocuments({
    status: "Completado",
  });
  const rejectCount = await ReportModel.countDocuments({ status: "Rechazado" });

  return {
    Pendiente: pendingCount,
    Revisado: viewCount,
    Aceptado: acceptedCount,
    Completado: completeCount,
    Rechazado: rejectCount,
  };
};

// Obtiene reportes aceptados y completados por mes (TODOS los reportes del sistema)
const getChartLineReportsPerYearData = async (year) => {
  // Reportes aceptados por mes
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

  // Reportes completados por mes
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

  // Inicializar arrays con 0 para cada mes
  const monthsAccepted = Array(12).fill(0);
  const monthsCompleted = Array(12).fill(0);

  // Llenar datos de reportes aceptados
  acceptedByMonth.forEach((item) => {
    monthsAccepted[item._id - 1] = item.count;
  });

  // Llenar datos de reportes completados
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

// Obtiene reportes por tipo por mes (TODOS los reportes del sistema)
const getChartLineReportTypesData = async (year) => {
  const chartLineReportTypesData = {
    year,
    months: MESES,
  };

  // Por cada tipo de reporte, obtener conteo por mes
  for (const reportType of TIPOS_REPORTE) {
    const dataByMonth = await ReportModel.aggregate([
      {
        $match: {
          report_type: reportType,
          created_at: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59`),
          },
        },
      },
      { $group: { _id: { $month: "$created_at" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Inicializar array con 0 para cada mes
    const monthsData = Array(12).fill(0);

    // Llenar datos del tipo de reporte
    dataByMonth.forEach((item) => {
      monthsData[item._id - 1] = item.count;
    });

    chartLineReportTypesData[reportType] = monthsData;
  }

  return chartLineReportTypesData;
};

// ============================================
// FUNCIONES AUXILIARES PARA OPERADOR
// ============================================

// Obtiene conteo de reportes por estado (SOLO del operador específico)
const getChartDoughnutDataOperator = async (operatorId) => {
  // Los pendientes NO se cuentan porque aún no están asignados a ningún operador
  const pendingCount = 0;

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

// Obtiene reportes aceptados y completados por mes (SOLO del operador específico)
const getChartLineReportsPerYearDataOperator = async (operatorId, year) => {
  // Reportes aceptados por mes del operador
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

  // Reportes completados por mes del operador
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

  // Inicializar arrays con 0 para cada mes
  const monthsAccepted = Array(12).fill(0);
  const monthsCompleted = Array(12).fill(0);

  // Llenar datos de reportes aceptados
  acceptedByMonth.forEach((item) => {
    monthsAccepted[item._id - 1] = item.count;
  });

  // Llenar datos de reportes completados
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

// Obtiene reportes por tipo por mes (SOLO del operador específico)
const getChartLineReportTypesDataOperator = async (operatorId, year) => {
  const chartLineReportTypesData = {
    year,
    months: MESES,
  };

  // Por cada tipo de reporte, obtener conteo por mes del operador
  for (const reportType of TIPOS_REPORTE) {
    const dataByMonth = await ReportModel.aggregate([
      {
        $match: {
          report_type: reportType,
          created_at: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59`),
          },
          assigned_operator: operatorId,
        },
      },
      { $group: { _id: { $month: "$created_at" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Inicializar array con 0 para cada mes
    const monthsData = Array(12).fill(0);

    // Llenar datos del tipo de reporte
    dataByMonth.forEach((item) => {
      monthsData[item._id - 1] = item.count;
    });

    chartLineReportTypesData[reportType] = monthsData;
  }

  return chartLineReportTypesData;
};

// ============================================
// ENDPOINTS PRINCIPALES
// ============================================

/**
 * Obtiene estadísticas para el Operador
 * - Solo muestra datos de reportes asignados a este operador
 * - Los reportes "Pendiente" no se cuentan (aún no están asignados)
 */
export const getOperatorStatistics = async (req, res) => {
  try {
    const operatorId = req.user._id;
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    // Obtener datos de gráficos usando las funciones auxiliares
    const chartDoughnutData = await getChartDoughnutDataOperator(operatorId);
    const chartLineReportsData = await getChartLineReportsPerYearDataOperator(
      operatorId,
      year
    );
    const chartLineReportTypesData = await getChartLineReportTypesDataOperator(
      operatorId,
      year
    );

    return res.status(200).json({
      ok: true,
      data: {
        chartDoughnutData,
        chartLineReportsData,
        chartLineReportTypesData,
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
 * - Muestra datos de TODOS los reportes del sistema
 * - Incluye conteo de usuarios por rol
 */
export const getAdminStatistics = async (req, res) => {
  try {
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    // Obtener datos de gráficos usando las funciones auxiliares
    const chartBarData = await getChartBarData();
    const chartDoughnutData = await getChartDoughnutData();
    const chartLineReportsData = await getChartLineReportsPerYearData(year);
    const chartLineReportTypesData = await getChartLineReportTypesData(year);

    return res.status(200).json({
      ok: true,
      data: {
        chartBarData,
        chartDoughnutData,
        chartLineReportsData,
        chartLineReportTypesData,
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

import ReportModel from "../models/report.model.js";
import UserModel from "../models/user.model.js";

// Funciones auxiliares que devuelven solo los datos
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

const getChartDoughnutData = async () => {
  const pendingCount = await ReportModel.countDocuments({
    status: "Pendiente",
  });
  const viewCount = await ReportModel.countDocuments({ status: "Revisado" });
  const aprovetCount = await ReportModel.countDocuments({ status: "Aprobado" });
  const completeCount = await ReportModel.countDocuments({
    status: "Completado",
  });
  const rejectCount = await ReportModel.countDocuments({ status: "Rechazado" });
  return {
    Pendiente: pendingCount,
    Revisado: viewCount,
    Aprobado: aprovetCount,
    Completado: completeCount,
    Rechazado: rejectCount,
  };
};

const getChartLineReportsPerYearData = async (year) => {
  // Agregación para reportes aprobados por mes (basado en approved_at)
  const aprovedByMonth = await ReportModel.aggregate([
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
  // Agregación para reportes completados por mes (basado en completed_at)
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
  const monthsApproved = Array(12).fill(0);
  const monthsCompleted = Array(12).fill(0);
  aprovedByMonth.forEach((item) => {
    monthsApproved[item._id - 1] = item.count;
  });
  completedByMonth.forEach((item) => {
    monthsCompleted[item._id - 1] = item.count;
  });
  return {
    year,
    months: [
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
    ],
    Aceptado: monthsApproved,
    Completado: monthsCompleted,
  };
};

const getChartLineReportTypesData = async (year) => {
  const reportTypes = ["Bache", "Alumbrado", "Basura", "Otro"];
  const chartLineReportTypesData = {
    year,
    months: [
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
    ],
  };
  for (const reportType of reportTypes) {
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
    const monthsData = Array(12).fill(0);
    dataByMonth.forEach((item) => {
      monthsData[item._id - 1] = item.count;
    });
    chartLineReportTypesData[reportType] = monthsData;
  }
  return chartLineReportTypesData;
};

export const getAdminStatistics = async (req, res) => {
  try {
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();
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
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

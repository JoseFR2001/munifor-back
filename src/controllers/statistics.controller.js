import ReportModel from "../models/report.model.js";
import UserModel from "../models/user.model.js";

export const getChartBar = async (req, res) => {
  try {
    const citizenCount = await UserModel.countDocuments({ role: "Ciudadano" });
    const operatorCount = await UserModel.countDocuments({ role: "Operador" });
    const workerCount = await UserModel.countDocuments({ role: "Trabajador" });
    const adminCount = await UserModel.countDocuments({
      role: "Administrador",
    });

    const chartBarData = {
      Ciudadano: citizenCount,
      Operador: operatorCount,
      Trabajador: workerCount,
      Administrador: adminCount,
    };

    return res.status(200).json({
      ok: true,
      data: chartBarData,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getChartDoughnut = async (req, res) => {
  try {
    const pendingCount = await ReportModel.countDocuments({
      status: "Pendiente",
    });
    const viewCount = await ReportModel.countDocuments({ status: "Revisado" });
    const aprovetCount = await ReportModel.countDocuments({
      status: "Aprobado",
    });
    const completeCount = await ReportModel.countDocuments({
      status: "Completado",
    });
    const rejectCount = await ReportModel.countDocuments({
      status: "Rechazado",
    });

    const chartDoughnutData = {
      Pendiente: pendingCount,
      Revisado: viewCount,
      Aprobado: aprovetCount,
      Completado: completeCount,
      Rechazado: rejectCount,
    };
    return res.status(200).json({
      ok: true,
      data: chartDoughnutData,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getChartLineReportsPerYear = async (req, res) => {
  try {
    // Obtener el año actual o el año especificado en query params
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

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
      {
        $group: {
          _id: { $month: "$approved_at" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
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
      {
        $group: {
          _id: { $month: "$completed_at" },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Crear arrays con 12 posiciones (enero a diciembre) inicializados en 0
    const monthsApproved = Array(12).fill(0);
    const monthsCompleted = Array(12).fill(0);

    // Llenar los datos de aprobados
    aprovedByMonth.forEach((item) => {
      monthsApproved[item._id - 1] = item.count;
    });

    // Llenar los datos de completados
    completedByMonth.forEach((item) => {
      monthsCompleted[item._id - 1] = item.count;
    });

    const chartLineReportsData = {
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

    return res.status(200).json({
      ok: true,
      data: chartLineReportsData,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getChartLineReportTypes = async (req, res) => {
  try {
    // Obtener el año actual o el año especificado en query params
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

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

    // Para cada tipo de reporte, hacer una agregación por mes
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
        {
          $group: {
            _id: { $month: "$created_at" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      // Crear array con 12 posiciones inicializados en 0
      const monthsData = Array(12).fill(0);

      // Llenar los datos
      dataByMonth.forEach((item) => {
        monthsData[item._id - 1] = item.count;
      });

      chartLineReportTypesData[reportType] = monthsData;
    }

    return res.status(200).json({
      ok: true,
      data: chartLineReportTypesData,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

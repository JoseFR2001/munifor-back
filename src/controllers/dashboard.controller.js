import CrewModel from "../models/crew.model.js";
import ReportModel from "../models/report.model.js";
import TaskModel from "../models/task.model.js";
import UserModel from "../models/user.model.js";

export const getDashboardCitizen = async (req, res) => {
  const authorId = req.user._id;
  try {
    // Conteo de reportes completados
    const completedCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Completado",
    });
    // Conteo de reportes aceptados
    const acceptedCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Aceptado",
    });
    // Conteo de reportes pendientes
    const pendingCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Pendiente",
    });
    // Conteo de reportes revisados (en seguimiento)
    const reviewedCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Revisado",
    });

    const rejectedCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Rechazado",
    });
    // Conteo total de reportes
    const totalCount = await ReportModel.countDocuments({ author: authorId });

    return res.json({
      ok: true,
      counts: {
        pending: pendingCount,
        reviewed: reviewedCount,
        completed: completedCount,
        accepted: acceptedCount,
        rejected: rejectedCount,
        total: totalCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getDashboardWorker = async (req, res) => {
  const workerId = req.user._id;

  try {
    // Conteo de tareas pendientes
    const pendingCount = await TaskModel.countDocuments({
      worker: workerId,
      status: "Pendiente",
    });
    // Conteo de tareas en progreso
    const inProgressCount = await TaskModel.countDocuments({
      worker: workerId,
      status: "En Progreso",
    });
    // Conteo de tareas finalizadas
    const completedCount = await TaskModel.countDocuments({
      worker: workerId,
      status: "Finalizada",
    });

    const totalCount = await TaskModel.countDocuments({ worker: workerId });

    return res.json({
      ok: true,
      counts: {
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        total: totalCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getOperatorDashboard = async (req, res) => {
  const operatorId = req.user._id;

  try {
    // Total de nuevos reportes (pendientes)
    const totalNewReports = await ReportModel.countDocuments({
      status: "Pendiente",
    });

    // En proceso (asignados al operador y en estado Aceptado)
    const inProcessCount = await ReportModel.countDocuments({
      assigned_operator: operatorId,
      status: "Aceptado",
    });

    // Completados (asignados al operador y en estado Completado)
    const completedCount = await ReportModel.countDocuments({
      assigned_operator: operatorId,
      status: "Completado",
    });

    // Rechazados (asignados al operador y en estado Rechazado)
    const rejectedCount = await ReportModel.countDocuments({
      assigned_operator: operatorId,
      status: "Rechazado",
    });

    // Cuadrillas activas (no eliminadas)
    const activeCrewsCount = await CrewModel.countDocuments({
      deleted_at: null,
    });

    // Tareas asignadas (tareas asignadas a cuadrillas activas)
    const assignedTasksCount = await TaskModel.countDocuments({
      status: { $in: ["Pendiente", "En Progreso"] },
    });

    return res.json({
      ok: true,
      counts: {
        totalNewReports,
        inProcess: inProcessCount,
        completed: completedCount,
        rejected: rejectedCount,
        activeCrews: activeCrewsCount,
        assignedTasks: assignedTasksCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    // Total de usuarios
    const totalUsers = await UserModel.countDocuments({ deleted_at: null });

    // Total de reportes
    const totalReports = await ReportModel.countDocuments({});

    // Nuevos reportes (pendientes)
    const newReports = await ReportModel.countDocuments({
      status: "Pendiente",
    });

    // Reportes completados
    const completedReports = await ReportModel.countDocuments({
      status: "Completado",
    });

    // Trabajadores activos
    const activeWorkers = await UserModel.countDocuments({
      role: "Trabajador",
      deleted_at: null,
    });

    // Operadores activos
    const activeOperators = await UserModel.countDocuments({
      role: "Operador",
      deleted_at: null,
    });

    // Tasa de eficiencia
    const efficiencyRate =
      totalReports > 0
        ? Math.round((completedReports / totalReports) * 100)
        : 0;

    return res.json({
      ok: true,
      counts: {
        totalUsers,
        totalReports,
        newReports,
        completedReports,
        activeWorkers,
        activeOperators,
        efficiencyRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

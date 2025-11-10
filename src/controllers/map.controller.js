import ReportModel from "../models/report.model.js";
import TaskModel from "../models/task.model.js";
import ProgressReportModel from "../models/progress_report.model.js";

/**
 * Obtiene datos del mapa para Admin/Vista General
 * - Todos los reportes del sistema
 * - Todas las tareas del sistema
 * - Todos los avances del sistema
 */
export const getMapaData = async (req, res) => {
  try {
    // Obtener reportes no eliminados
    const reports = await ReportModel.find({ deleted_at: null });

    // Obtener tareas no eliminadas (ya tienen su propia ubicación)
    const tasks = await TaskModel.find({ deleted_at: null });

    // Obtener reportes de progreso (ya tienen su propia ubicación)
    const progress = await ProgressReportModel.find({
      deleted_at: null,
    });

    return res.status(200).json({
      ok: true,
      reports,
      tasks,
      progress,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getMapaOperatorData = async (req, res) => {
  const operatorId = req.user._id;
  try {
    // 1. Obtener reportes asignados a este operador
    const reports = await ReportModel.find({
      deleted_at: null,
      assigned_operator: operatorId,
    });

    // 2. Obtener tareas asignadas a este operador (ya tienen su propia ubicación)
    const tasks = await TaskModel.find({
      deleted_at: null,
      assigned_operator: operatorId,
    });

    // 3. Obtener IDs de las tareas del operador
    const taskIds = tasks.map((task) => task._id);

    // 4. Obtener solo los avances de las tareas asignadas a este operador
    const progress = await ProgressReportModel.find({
      deleted_at: null,
      task: { $in: taskIds }, // Solo avances de sus tareas
    });

    return res.status(200).json({
      ok: true,
      reports,
      tasks,
      progress,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

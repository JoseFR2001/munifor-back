import ReportModel from "../models/report.model.js";
import TaskModel from "../models/task.model.js";
import ProgressReportModel from "../models/progress_report.model.js";

export const getMapaData = async (req, res) => {
  try {
    // Obtener reportes no eliminados
    const reports = await ReportModel.find({ deleted_at: null });

    // Obtener tareas no eliminadas
    const tasks = await TaskModel.find({ deleted_at: null }).populate(
      "report",
      "location report_type"
    );

    // Obtener reportes de progreso
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

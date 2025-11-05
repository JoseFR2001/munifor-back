import ReportModel from "../models/report.model.js";

export const getReportCitizenCounts = async (req, res) => {
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

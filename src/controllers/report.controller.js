import ReportModel from "../models/report.model.js";
import UserModel from "../models/user.model.js";

export const createReport = async (req, res) => {
  try {
    // Consultar el usuario en la base de datos
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }
    // Verificar si el ciudadano está baneado
    if (
      user.role === "Ciudadano" &&
      user.role_data?.is_banned !== null &&
      user.role_data?.is_banned !== false
    ) {
      return res.status(403).json({
        ok: false,
        msg: "No puedes crear reportes porque estás baneado.",
      });
    }
    // Crear el reporte con el author correcto
    const newReport = await ReportModel.create({
      ...req.body,
      author: user._id,
    });
    return res.status(201).json({
      ok: true,
      report: newReport,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await ReportModel.find();
    return res.status(200).json({
      ok: true,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getReportById = async (req, res) => {
  const { id } = req.params;
  try {
    const report = await ReportModel.findById(id);
    return res.status(200).json({
      ok: true,
      report,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getAllReportsForAuthor = async (req, res) => {
  try {
    // Usar el id del usuario logueado
    const authorId = req.user._id;
    const reports = await ReportModel.find({ author: authorId });
    return res.status(200).json({
      ok: true,
      reports,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

// * Obtener reportes segun estado
export const getReportsPending = async (req, res) => {
  try {
    const reports = await ReportModel.find({ status: "Pendiente" });
    return res.status(200).json({
      ok: true,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

export const getReportsAccepted = async (req, res) => {
  try {
    const reports = await ReportModel.find({ status: "Aceptado" });
    return res.status(200).json({
      ok: true,
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

// * Actualizar reportes
export const updateReport = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedReport = await ReportModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json({
      ok: true,
      report: updatedReport,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

// * Actualizar estados
export const reviewReport = async (req, res) => {
  const { id } = req.params; // El id del reporte a actualizar
  console.log(id);
  try {
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      { status: "Revisado" }, // El backend decide el nuevo valor
      { new: true }
    );
    if (!updatedReport) {
      return res.status(404).json({ ok: false, msg: "Report not found" });
    }
    return res.status(200).json({ ok: true, report: updatedReport });
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, msg: "Error interno del servidor" });
  }
};
export const acceptReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      {
        status: "Aceptado",
        approved_at: new Date(),
      },
      { new: true }
    );
    if (!updatedReport) {
      return res.status(404).json({ ok: false, msg: "Report not found" });
    }
    return res.status(200).json({ ok: true, report: updatedReport });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

export const completeReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      {
        status: "Completado",
        completed_at: new Date(),
      },
      { new: true }
    );
    if (!updatedReport) {
      return res.status(404).json({ ok: false, msg: "Report not found" });
    }
    return res.status(200).json({ ok: true, report: updatedReport });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

export const rejectReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      { status: "Rechazado" },
      { new: true }
    );
    if (!updatedReport) {
      return res.status(404).json({ ok: false, msg: "Report not found" });
    }
    return res.status(200).json({ ok: true, report: updatedReport });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

// * Eliminar reportes
export const deleteReport = async (req, res) => {
  const { id } = req.params;
  try {
    await ReportModel.findByIdAndDelete(id);
    return res.status(200).json({
      ok: true,
      msg: "Reporte eliminado exitosamente",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

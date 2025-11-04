import ReportModel from "../models/report.model.js";

export const createReport = async (req, res) => {
  try {
    //!Debo añadir el tema de que el author sea el user logueado
    //!Debo añadir logica para que detecte quien lo hace
    //!Si es ciudadano, que el author sea el user logueado
    //!Si es un trabajador, que el reporte tenga un nuevo campo
    //!Este nuevo campo se llamara  is_avanced
    const newReport = await ReportModel.create(req.body);
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
  const { id } = req.params;
  try {
    // ! Debo modificar esto para que tome el id del user logueado sin que se reciba por params
    const reports = await ReportModel.find({ author: id });
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
      { status: "Aceptado" },
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
      { status: "Completado" },
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

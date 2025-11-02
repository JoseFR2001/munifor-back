import ReportModel from "../models/report.model.js";

export const createReport = async (req, res) => {
  try {
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

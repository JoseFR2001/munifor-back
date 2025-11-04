import ProgressReportModel from "../models/progress_report.model.js";

export const createProgressReport = async (req, res) => {
  try {
    const newProgressReport = await ProgressReportModel.create(req.body);
    return res
      .status(201)
      .json({ ok: true, progress_report: newProgressReport });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

export const getAllProgressReports = async (req, res) => {
  try {
    const progressReports = await ProgressReportModel.find();
    return res
      .status(200)
      .json({ ok: true, progress_reports: progressReports });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

export const getProgressReportById = async (req, res) => {
  const { id } = req.params;
  try {
    const progressReport = await ProgressReportModel.findById(id);
    return res.status(200).json({ ok: true, progress_report: progressReport });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

export const updateProgressReport = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProgressReport = await ProgressReportModel.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    return res
      .status(200)
      .json({ ok: true, progress_report: updatedProgressReport });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

export const deleteProgressReport = async (req, res) => {
  const { id } = req.params;
  try {
    await ProgressReportModel.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ ok: true, msg: "Progress report deleted successfully" });
  } catch (error) {
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

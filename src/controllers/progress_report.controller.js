import ProgressReportModel from "../models/progress_report.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProgressReport = async (req, res) => {
  try {
    // Procesar imágenes si existen
    const images = req.files
      ? req.files.map((file) => `uploads/progress/${file.filename}`)
      : [];

    const newProgressReport = await ProgressReportModel.create({
      ...req.body,
      images,
    });
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

export const getProgressByLeader = async (req, res) => {
  const leaderId = req.user._id;
  try {
    const progressReports = await ProgressReportModel.find({
      worker: leaderId,
    });
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
    // Procesar nuevas imágenes si existen
    const newImages = req.files
      ? req.files.map((file) => `uploads/progress/${file.filename}`)
      : [];

    const updateData = { ...req.body };
    if (newImages.length > 0) {
      // Agregar nuevas imágenes a las existentes
      const progressReport = await ProgressReportModel.findById(id);
      updateData.images = [...(progressReport.images || []), ...newImages];
    }

    const updatedProgressReport = await ProgressReportModel.findByIdAndUpdate(
      id,
      updateData,
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

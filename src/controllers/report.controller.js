//* ============================================
//* CONTROLADOR DE REPORTES
//* ============================================

//! IMPORTS DE MODELOS Y DEPENDENCIAS
import CrewModel from "../models/crew.model.js";
import ReportModel from "../models/report.model.js";
import UserModel from "../models/user.model.js";
import fs from "fs"; // Sistema de archivos
import path from "path"; // Manejo de rutas
import { fileURLToPath } from "url"; // Conversión de URL

//* CONFIGURACIÓN DE __dirname PARA MÓDULOS ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* ============================================
//* CREAR REPORTE (CON IMÁGENES)
//* ============================================

/**
 * Crea un nuevo reporte ciudadano
 * - Procesa imágenes subidas con Multer (máximo 5)
 * - Asocia el reporte al usuario autenticado
 */
export const createReport = async (req, res) => {
  try {
    //? Obtener el usuario autenticado
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ ok: false, msg: "Usuario no encontrado" });
    }

    //? Procesar imágenes si existen
    // req.files viene de Multer cuando se suben múltiples archivos
    // Mapea cada archivo a su ruta: "uploads/reports/report-123.jpg"
    const images = req.files
      ? req.files.map((file) => `uploads/reports/${file.filename}`)
      : [];

    //? Crear el nuevo reporte en la base de datos
    const newReport = await ReportModel.create({
      ...req.body, // Todos los campos del body (title, description, location, etc.)
      author: user._id, // Asociar al usuario autenticado
      images, // Array de rutas de imágenes
    });

    console.log("Se a credo exitosamente");

    //* Respuesta exitosa
    return res.status(201).json({
      ok: true,
      report: newReport,
    });
  } catch (error) {
    //! Error del servidor
    console.log(error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

// * Obtener reportes
export const getAllReports = async (req, res) => {
  try {
    const reports = await ReportModel.find().sort({ created_at: -1 }); // Ordenar por fecha de creación descendente
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
    const reports = await ReportModel.find({ author: authorId }).sort({
      created_at: -1,
    }); // Ordenar por fecha de creación descendente
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

export const getReportsByOperator = async (req, res) => {
  try {
    const operatorId = req.user._id;
    const reports = await ReportModel.find({
      $or: [{ assigned_operator: operatorId }, { status: "Pendiente" }],
    })
      .sort({ created_at: -1 }) // Ordenar por fecha de creación descendente
      .populate("author", "username");

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

export const getNewReports = async (req, res) => {
  try {
    const reports = await ReportModel.find({ status: "Pendiente" })
      .sort({ created_at: -1 }) // Ordenar por fecha de creación descendente
      .populate("author", "username");
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

// * Obtener reportes segun estado
export const getReportsPending = async (req, res) => {
  try {
    const reports = await ReportModel.find({ status: "Pendiente" }).sort({
      created_at: -1,
    }); // Ordenar por fecha de creación descendente
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

export const getReportsCompleted = async (req, res) => {
  try {
    const reports = await ReportModel.find({ status: "Completado" })
      .populate("author", "username email")
      .populate("assigned_operator", "username email")
      .sort({ completed_at: -1 }); // Más recientes primero
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

export const getReportsOperatorAccepted = async (req, res) => {
  const operatorId = req.user._id;
  try {
    const reports = await ReportModel.find({
      status: "Aceptado",
      task_assigned: false,
      assigned_operator: operatorId,
    }).sort({ created_at: -1 }); // Ordenar por fecha de creación descendente
    const crews = await CrewModel.find({ deleted_at: null }).sort({
      createdAt: -1,
    }); // Ordenar por fecha de creación descendente
    return res.status(200).json({
      ok: true,
      reports,
      crews,
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
    // Procesar nuevas imágenes si existen
    const newImages = req.files
      ? req.files.map((file) => `uploads/reports/${file.filename}`)
      : [];

    // Si hay nuevas imágenes, agregarlas a las existentes o reemplazarlas según la lógica
    const updateData = { ...req.body };
    if (newImages.length > 0) {
      // Opción 1: Agregar a las existentes
      const report = await ReportModel.findById(id);
      updateData.images = [...(report.images || []), ...newImages];

      // Opción 2: Reemplazar todas (comentada)
      // updateData.images = newImages;
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(id, updateData, {
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

//* ============================================
//* ACTUALIZAR ESTADOS DE REPORTES
//* ============================================

/**
 * Cambia el estado de un reporte a "Revisado"
 * - Asigna el operador que revisó el reporte
 * - Solo operadores pueden hacer esto
 */
export const reviewReport = async (req, res) => {
  const { id } = req.params; // El id del reporte a actualizar
  console.log(id);
  try {
    //? Actualizar estado a "Revisado" y asignar operador
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      {
        status: "Revisado",
        assigned_operator: req.user._id, // Operador autenticado
      },
      { new: true } // Devolver documento actualizado
    );

    //! Si no existe el reporte
    if (!updatedReport) {
      return res.status(404).json({ ok: false, msg: "Report not found" });
    }

    //* Respuesta exitosa
    return res.status(200).json({ ok: true, report: updatedReport });
  } catch (error) {
    //! Error del servidor
    return res
      .status(500)
      .json({ ok: false, msg: "Error interno del servidor" });
  }
};

/**
 * Cambia el estado de un reporte a "Aceptado"
 * - Registra la fecha de aprobación
 * - El operador puede crear una tarea después de esto
 */
export const acceptReport = async (req, res) => {
  try {
    const { id } = req.params;

    //? Actualizar estado a "Aceptado" y registrar fecha
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      {
        status: "Aceptado",
        approved_at: new Date(), // Registrar fecha de aprobación
      },
      { new: true }
    );

    //! Si no existe el reporte
    if (!updatedReport) {
      return res.status(404).json({ ok: false, msg: "Report not found" });
    }

    //* Respuesta exitosa
    return res.status(200).json({ ok: true, report: updatedReport });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

/**
 * Cambia el estado de un reporte a "Completado"
 * - Registra la fecha de finalización
 * - Normalmente esto se hace automáticamente cuando el ProgressReport se finaliza
 */
export const completeReport = async (req, res) => {
  try {
    const { id } = req.params;

    //? Actualizar estado a "Completado" y registrar fecha
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      {
        status: "Completado",
        completed_at: new Date(), // Registrar fecha de finalización
      },
      { new: true }
    );

    //! Si no existe el reporte
    if (!updatedReport) {
      return res.status(404).json({ ok: false, msg: "Report not found" });
    }

    //* Respuesta exitosa
    return res.status(200).json({ ok: true, report: updatedReport });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

/**
 * Cambia el estado de un reporte a "Rechazado"
 * - El operador determina que el reporte no procede
 */
export const rejectReport = async (req, res) => {
  try {
    const { id } = req.params;

    //? Actualizar estado a "Rechazado"
    const updatedReport = await ReportModel.findByIdAndUpdate(
      id,
      { status: "Rechazado" },
      { new: true }
    );

    //! Si no existe el reporte
    if (!updatedReport) {
      return res.status(404).json({ ok: false, msg: "Report not found" });
    }

    //* Respuesta exitosa
    return res.status(200).json({ ok: true, report: updatedReport });
  } catch (error) {
    //! Error del servidor
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

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// createReport = crear reporte
// getAllReports = obtener todos los reportes
// getReportById = obtener reporte por ID
// getAllReportsForAuthor = obtener todos los reportes del autor
// getReportsByOperator = obtener reportes por operador
// getNewReports = obtener reportes nuevos
// getReportsPending = obtener reportes pendientes
// getReportsCompleted = obtener reportes completados
// getReportsOperatorAccepted = obtener reportes aceptados del operador
// updateReport = actualizar reporte
// reviewReport = revisar reporte
// acceptReport = aceptar reporte
// completeReport = completar reporte
// rejectReport = rechazar reporte
// deleteReport = eliminar reporte
// images = imágenes
// newImages = nuevas imágenes
// author = autor
// assigned_operator = operador asignado
// approved_at = aprobado en (fecha)
// completed_at = completado en (fecha)
// task_assigned = tarea asignada (booleano)
// populate = poblar/llenar (incluir datos de referencia)
// status = estado
// $lte = Less Than or Equal (menor o igual que)

//* ============================================
//* CONTROLADOR DE AVANCES (PROGRESS REPORTS)
//* ============================================

//! IMPORTS DE MODELOS Y DEPENDENCIAS
import ProgressReportModel from "../models/progress_report.model.js";
import TaskModel from "../models/task.model.js";
import ReportModel from "../models/report.model.js";
import fs from "fs"; // Sistema de archivos
import path from "path"; // Manejo de rutas
import { fileURLToPath } from "url"; // Conversión de URL

//* CONFIGURACIÓN DE __dirname PARA MÓDULOS ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* ============================================
//* ⚠️ CREAR AVANCE CON AUTO-COMPLETADO EN CASCADA
//* ============================================

/**
 * Crea un nuevo avance de progreso
 *
 * ⚠️ LÓGICA ESPECIAL - AUTO-COMPLETADO EN CASCADA:
 * Si el status del avance es "Finalizado":
 * 1. Actualiza la Task asociada a status="Finalizada"
 * 2. Actualiza TODOS los Reports de esa Task a status="Completado"
 *
 * Esto automatiza el flujo completo sin intervención manual del operador
 */
export const createProgressReport = async (req, res) => {
  try {
    //? Procesar imágenes subidas con Multer (si existen)
    const images = req.files
      ? req.files.map((file) => `uploads/progress/${file.filename}`)
      : [];

    //? Crear el nuevo avance en la base de datos
    const newProgressReport = await ProgressReportModel.create({
      ...req.body, // Todos los campos del body
      images, // Array de rutas de imágenes
    });

    //! ⚠️ LÓGICA DE AUTO-COMPLETADO EN CASCADA
    // Si el progress report tiene status "Finalizado"
    if (newProgressReport.status === "Finalizado") {
      //? PASO 1: Actualizar la tarea relacionada a "Finalizada"
      const task = await TaskModel.findByIdAndUpdate(
        newProgressReport.task, // ID de la tarea asociada
        {
          status: "Finalizada", // Cambiar estado
          completed_at: new Date(), // Registrar fecha de finalización
        },
        { new: true } // Devolver documento actualizado
      );

      //? PASO 2: Actualizar TODOS los reportes asociados a la tarea
      // Una tarea puede tener múltiples reportes en su array task.report
      // Usamos updateMany con $in para actualizar todos a la vez
      if (task && task.report && task.report.length > 0) {
        await ReportModel.updateMany(
          { _id: { $in: task.report } }, // Buscar todos los IDs en el array
          {
            status: "Completado", // Cambiar estado
            completed_at: new Date(), // Registrar fecha de finalización
          }
        );
      }
    }

    //* Respuesta exitosa con el avance creado
    return res
      .status(201)
      .json({ ok: true, progress_report: newProgressReport });
  } catch (error) {
    console.error("Error al crear progress report:", error);
    //! Error del servidor
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

//* ============================================
//* OBTENER TODOS LOS AVANCES
//* ============================================

/**
 * Obtiene todos los avances del sistema
 */
export const getAllProgressReports = async (req, res) => {
  try {
    //? Buscar todos los avances
    const progressReports = await ProgressReportModel.find();

    //* Respuesta exitosa
    return res
      .status(200)
      .json({ ok: true, progress_reports: progressReports });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

//* ============================================
//* OBTENER AVANCES POR LÍDER
//* ============================================

/**
 * Obtiene todos los avances creados por un líder específico
 * El líder es el usuario logueado (viene del middleware de autenticación)
 */
export const getProgressByLeader = async (req, res) => {
  const leaderId = req.user._id; // ID del usuario autenticado
  try {
    //? Buscar avances donde el worker es este líder
    const progressReports = await ProgressReportModel.find({
      worker: leaderId,
    });

    //* Respuesta exitosa
    return res
      .status(200)
      .json({ ok: true, progress_reports: progressReports });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

//* ============================================
//* OBTENER AVANCE POR ID
//* ============================================

/**
 * Obtiene un avance específico por su ID
 */
export const getProgressReportById = async (req, res) => {
  const { id } = req.params;
  try {
    //? Buscar avance por ID
    const progressReport = await ProgressReportModel.findById(id);

    //* Respuesta exitosa
    return res.status(200).json({ ok: true, progress_report: progressReport });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

//* ============================================
//* ACTUALIZAR AVANCE (CON IMÁGENES)
//* ============================================

/**
 * Actualiza un avance existente
 * Si se suben nuevas imágenes, se AGREGAN a las existentes (no se reemplazan)
 */
export const updateProgressReport = async (req, res) => {
  const { id } = req.params;
  try {
    //? Procesar nuevas imágenes si existen
    const newImages = req.files
      ? req.files.map((file) => `uploads/progress/${file.filename}`)
      : [];

    //? Preparar datos de actualización
    const updateData = { ...req.body };

    //? Si hay nuevas imágenes, agregarlas a las existentes
    if (newImages.length > 0) {
      const progressReport = await ProgressReportModel.findById(id);
      updateData.images = [...(progressReport.images || []), ...newImages];
    }

    //? Actualizar el avance en la base de datos
    const updatedProgressReport = await ProgressReportModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true } // Devolver documento actualizado
    );

    //* Respuesta exitosa
    return res
      .status(200)
      .json({ ok: true, progress_report: updatedProgressReport });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

//* ============================================
//* ELIMINAR AVANCE (HARD DELETE)
//* ============================================

/**
 * Elimina permanentemente un avance de la base de datos
 * NOTA: Esto es hard delete, no soft delete
 */
export const deleteProgressReport = async (req, res) => {
  const { id } = req.params;
  try {
    //? Eliminar avance permanentemente
    await ProgressReportModel.findByIdAndDelete(id);

    //* Respuesta exitosa
    return res
      .status(200)
      .json({ ok: true, msg: "Progress report deleted successfully" });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({ ok: false, msg: "Internal server error" });
  }
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// ProgressReport = Avance/Reporte de Progreso
// createProgressReport = crear avance
// getAllProgressReports = obtener todos los avances
// getProgressByLeader = obtener avances por líder
// getProgressReportById = obtener avance por ID
// updateProgressReport = actualizar avance
// deleteProgressReport = eliminar avance
// images = imágenes
// newImages = nuevas imágenes
// updateData = datos de actualización
// completed_at = completado en (fecha)
// $in = operador de MongoDB para buscar valores dentro de un array
// updateMany = actualizar múltiples documentos a la vez
// findByIdAndUpdate = buscar por ID y actualizar
// findByIdAndDelete = buscar por ID y eliminar

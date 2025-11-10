//* ============================================
//* CONTROLADOR DE MAPAS - DATOS GEOGRÁFICOS
//* ============================================

//! IMPORTS DE MODELOS
import ReportModel from "../models/report.model.js";
import TaskModel from "../models/task.model.js";
import ProgressReportModel from "../models/progress_report.model.js";

//* ============================================
//* OBTENER DATOS DEL MAPA - VISTA GENERAL (ADMIN)
//* ============================================

/**
 * Obtiene datos del mapa para Admin/Vista General
 * Incluye:
 * - Todos los reportes del sistema
 * - Todas las tareas del sistema
 * - Todos los avances del sistema
 *
 * Cada uno tiene su ubicación (location: { lat, lng })
 * para mostrar en el mapa del frontend
 */
export const getMapaData = async (req, res) => {
  try {
    //? Obtener reportes no eliminados
    // Cada reporte tiene location.lat y location.lng
    const reports = await ReportModel.find({ deleted_at: null });

    //? Obtener tareas no eliminadas
    // Las tareas tienen su propia ubicación
    const tasks = await TaskModel.find({ deleted_at: null });

    //? Obtener reportes de progreso/avances
    // Los avances también tienen ubicación
    const progress = await ProgressReportModel.find({
      deleted_at: null,
    });

    //* Respuesta con todos los datos para el mapa
    return res.status(200).json({
      ok: true,
      reports, // Marcadores de reportes ciudadanos
      tasks, // Marcadores de tareas asignadas
      progress, // Marcadores de avances de cuadrillas
    });
  } catch (error) {
    console.log(error);
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* OBTENER DATOS DEL MAPA - VISTA OPERADOR
//* ============================================

/**
 * Obtiene datos del mapa para un Operador específico
 * Solo muestra:
 * - Reportes asignados a este operador
 * - Tareas creadas por este operador
 * - Avances de las tareas de este operador
 *
 * Esto permite que cada operador vea solo su zona/trabajo
 */
export const getMapaOperatorData = async (req, res) => {
  const operatorId = req.user._id; // ID del operador autenticado
  try {
    //? 1. Obtener reportes asignados a este operador
    const reports = await ReportModel.find({
      deleted_at: null,
      assigned_operator: operatorId, // Solo sus reportes
    });

    //? 2. Obtener tareas asignadas a este operador
    const tasks = await TaskModel.find({
      deleted_at: null,
      assigned_operator: operatorId, // Solo sus tareas
    });

    //? 3. Obtener IDs de las tareas del operador
    // Necesitamos los IDs para buscar los avances relacionados
    const taskIds = tasks.map((task) => task._id);

    //? 4. Obtener solo los avances de las tareas de este operador
    // $in: busca avances cuyo task esté en el array taskIds
    const progress = await ProgressReportModel.find({
      deleted_at: null,
      task: { $in: taskIds }, // Solo avances de sus tareas
    });

    //* Respuesta con datos filtrados del operador
    return res.status(200).json({
      ok: true,
      reports, // Solo reportes del operador
      tasks, // Solo tareas del operador
      progress, // Solo avances de tareas del operador
    });
  } catch (error) {
    console.log(error);
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// map = mapa
// getMapaData = obtener datos del mapa
// getMapaOperatorData = obtener datos del mapa del operador
// reports = reportes
// tasks = tareas
// progress = avances/reportes de progreso
// location = ubicación
// lat = latitud
// lng = longitud
// deleted_at = fecha de eliminación
// assigned_operator = operador asignado
// operatorId = ID del operador
// taskIds = IDs de las tareas
// $in = operador de MongoDB para buscar valores en un array
// map() = método de JavaScript para transformar arrays

//* ============================================
//* CONTROLADOR DE TAREAS
//* ============================================

//! IMPORTS DE MODELOS
import CrewModel from "../models/crew.model.js";
import ReportModel from "../models/report.model.js";
import TaskModel from "../models/task.model.js";

//* ============================================
//* CREAR TAREA
//* ============================================

/**
 * Crea una nueva tarea
 * - Asocia automáticamente al operador autenticado
 * Body esperado: { title, crew, report[], priority, task_type, location }
 */
export const createTask = async (req, res) => {
  const operatorId = req.user._id; // ID del operador autenticado
  try {
    //? Crear nueva tarea con datos del body + operador
    const newTask = await TaskModel.create({
      ...req.body, // Datos de la tarea
      assigned_operator: operatorId, // Asignar operador automáticamente
    }); // No se puede usar .sort() en create, solo en find
    await ReportModel.updateMany(
      { _id: { $in: req.body.report } },
      {
        task_assigned: true,
      }
    );

    //* Respuesta exitosa con tarea creada
    return res.status(201).json({
      ok: true,
      task: newTask,
    });
  } catch (error) {
    //! Error del servidor
    console.error(error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* OBTENER TODAS LAS TAREAS
//* ============================================

/**
 * Obtiene todas las tareas del sistema
 * Útil para administradores
 */
export const getAllTasks = async (req, res) => {
  try {
    //? Buscar todas las tareas
    const tasks = await TaskModel.find().sort({ created_at: -1 }); // Ordenar por fecha de creación descendente

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      tasks,
    });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* OBTENER TAREA POR ID
//* ============================================

/**
 * Obtiene una tarea específica por su ID
 */
export const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    //? Buscar tarea por ID
    const task = await TaskModel.findById(id);

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      task,
    });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* OBTENER TAREAS DE UN TRABAJADOR
//* ============================================

/**
 * Obtiene las tareas asignadas a la cuadrilla del trabajador
 * Primero busca la cuadrilla del trabajador, luego las tareas de esa cuadrilla
 */
export const getTaskWorker = async (req, res) => {
  const workerId = req.user._id; // ID del trabajador autenticado
  try {
    console.log(workerId);

    //? Buscar cuadrilla donde el trabajador es miembro o líder
    const crew = await CrewModel.findOne({
      $or: [{ members: workerId }, { leader: workerId }],
      deleted_at: null, // Solo cuadrillas activas
    }).sort({ created_at: -1 }); // Ordenar por fecha de creación descendente

    //! Si el trabajador no está en ninguna cuadrilla
    if (!crew)
      return res.status(400).json({ ok: false, msg: "La cuadrilla no existe" });

    //? Buscar todas las tareas asignadas a esa cuadrilla
    const tasks = await TaskModel.find({ crew: crew._id }).sort({
      created_at: -1,
    });

    //* Respuesta con cuadrilla y tareas
    return res.status(200).json({
      ok: true,
      crew: crew,
      tasks,
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
//* OBTENER TAREAS DE UN OPERADOR
//* ============================================

/**
 * Obtiene todas las tareas creadas por el operador autenticado
 */
export const getTaskOperator = async (req, res) => {
  const operatorId = req.user._id; // ID del operador autenticado
  try {
    //? Buscar tareas donde assigned_operator es este operador
    const tasks = await TaskModel.find({
      assigned_operator: operatorId,
    })
      .sort({ created_at: -1 }) // Ordenar por fecha de creación descendente
      .populate("crew", "name");

    //* Respuesta exitosa con las tareas
    return res.status(200).json({
      ok: true,
      tasks,
    });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* ACEPTAR/INICIAR TAREA
//* ============================================

/**
 * Cambia el estado de una tarea a "En Progreso"
 * El líder de la cuadrilla acepta la tarea y comienza a trabajar
 */
export const acceptTask = async (req, res) => {
  const { id } = req.params;
  try {
    //? Actualizar estado de la tarea a "En Progreso"
    const acceptedTask = await TaskModel.findByIdAndUpdate(
      id,
      { status: "En Progreso" },
      { new: true } // Devolver documento actualizado
    );

    //* Respuesta exitosa con tarea actualizada
    return res.status(200).json({
      ok: true,
      task: acceptedTask,
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
//* ACTUALIZAR TAREA
//* ============================================

/**
 * Actualiza los datos de una tarea
 * Puede actualizar: title, priority, crew, etc.
 */
export const updateTask = async (req, res) => {
  const { id } = req.params;
  try {
    //? Actualizar tarea con nuevos datos
    const updatedTask = await TaskModel.findByIdAndUpdate(id, req.body, {
      new: true, // Devolver documento actualizado
    });

    //* Respuesta exitosa con tarea actualizada
    return res.status(200).json({
      ok: true,
      task: updatedTask,
    });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* ELIMINAR TAREA (HARD DELETE)
//* ============================================

/**
 * Elimina permanentemente una tarea de la base de datos
 * NOTA: Esto es hard delete, no soft delete
 * TODO: Considerar cambiar a soft delete usando deleted_at
 */
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    //? Eliminar tarea permanentemente
    await TaskModel.findByIdAndDelete(id);

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      msg: "Task deleted successfully",
    });
  } catch (error) {
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
// task = tarea
// createTask = crear tarea
// getAllTasks = obtener todas las tareas
// getTaskById = obtener tarea por ID
// getTaskWorker = obtener tareas del trabajador
// getTaskOperator = obtener tareas del operador
// acceptTask = aceptar/iniciar tarea
// updateTask = actualizar tarea
// deleteTask = eliminar tarea
// operatorId = ID del operador
// workerId = ID del trabajador
// assigned_operator = operador asignado
// crew = cuadrilla
// status = estado
// priority = prioridad
// task_type = tipo de tarea
// report = reportes asociados
// $or = operador OR de MongoDB
// deleted_at = fecha de eliminación

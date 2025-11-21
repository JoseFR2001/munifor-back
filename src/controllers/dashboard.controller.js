//* ============================================
//* CONTROLADOR DE DASHBOARDS (TABLEROS)
//* ============================================
//? Este controlador proporciona estadísticas específicas para cada rol de usuario
//? Cada función retorna conteos (countDocuments) de diferentes entidades según el rol

//! IMPORTS DE MODELOS
import CrewModel from "../models/crew.model.js";
import ReportModel from "../models/report.model.js";
import TaskModel from "../models/task.model.js";
import UserModel from "../models/user.model.js";

//* ============================================
//* DASHBOARD PARA CIUDADANOS
//* ============================================

/**
 * Dashboard del Ciudadano
 * @description Muestra estadísticas de los reportes creados por el ciudadano
 * @route GET /api/dashboard/citizens
 * @access Ciudadanos autenticados
 */
export const getDashboardCitizen = async (req, res) => {
  const authorId = req.user._id; //? ID del ciudadano logueado

  try {
    //? Conteo de reportes completados del ciudadano
    const completedCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Completado",
    });

    //? Conteo de reportes aceptados del ciudadano
    const acceptedCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Aceptado",
    });

    //? Conteo de reportes pendientes del ciudadano
    const pendingCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Pendiente",
    });

    //? Conteo de reportes en revisión del ciudadano
    const reviewedCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Revisado",
    });

    //? Conteo de reportes rechazados del ciudadano
    const rejectedCount = await ReportModel.countDocuments({
      author: authorId,
      status: "Rechazado",
    });

    //? Conteo total de reportes del ciudadano
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

//* ============================================
//* DASHBOARD PARA TRABAJADORES
//* ============================================

/**
 * Dashboard del Trabajador
 * @description Muestra estadísticas de tareas de la cuadrilla del trabajador
 * @route GET /api/dashboard/workers
 * @access Trabajadores autenticados
 */
export const getDashboardWorker = async (req, res) => {
  const workerId = req.user._id; //? ID del trabajador logueado

  try {
    //? Buscar la cuadrilla del trabajador
    // Usa $or para buscar si es miembro O líder
    const crew = await CrewModel.findOne({
      $or: [{ members: workerId }, { leader: workerId }],
      deleted_at: null, //? Solo cuadrillas activas
    });

    //! Si el trabajador no pertenece a ninguna cuadrilla, retornar todo en 0
    if (!crew) {
      return res.json({
        ok: true,
        counts: {
          pending: 0,
          inProgress: 0,
          completed: 0,
          total: 0,
        },
      });
    }

    //? Contar tareas pendientes de la cuadrilla
    const pendingCount = await TaskModel.countDocuments({
      crew: crew._id,
      status: "Pendiente",
    });

    //? Contar tareas en progreso de la cuadrilla
    const inProgressCount = await TaskModel.countDocuments({
      crew: crew._id,
      status: "En Progreso",
    });

    //? Contar tareas completadas de la cuadrilla
    const completedCount = await TaskModel.countDocuments({
      crew: crew._id,
      status: "Finalizada",
    });

    //? Contar total de tareas de la cuadrilla
    const totalCount = await TaskModel.countDocuments({
      crew: crew._id,
    });

    return res.json({
      ok: true,
      counts: {
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
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

//* ============================================
//* DASHBOARD PARA OPERADORES
//* ============================================

/**
 * Dashboard del Operador
 * @description Muestra estadísticas de reportes y tareas del operador
 * @route GET /api/dashboard/operators
 * @access Operadores autenticados
 */
export const getOperatorDashboard = async (req, res) => {
  const operatorId = req.user._id; //? ID del operador logueado

  try {
    //? Total de reportes nuevos (pendientes de asignar)
    // Los reportes "Pendiente" aún no tienen assigned_operator
    const totalNewReports = await ReportModel.countDocuments({
      status: "Pendiente",
    });

    //? Reportes en proceso (asignados al operador y aceptados)
    const inProcessCount = await ReportModel.countDocuments({
      assigned_operator: operatorId,
      status: "Aceptado",
    });

    //? Reportes completados por el operador
    const completedCount = await ReportModel.countDocuments({
      assigned_operator: operatorId,
      status: "Completado",
    });

    //? Reportes rechazados por el operador
    const rejectedCount = await ReportModel.countDocuments({
      assigned_operator: operatorId,
      status: "Rechazado",
    });

    //? Total de cuadrillas activas (no eliminadas)
    // Para asignar a las tareas
    const activeCrewsCount = await CrewModel.countDocuments({
      deleted_at: null,
    });

    //? Tareas asignadas en progreso del operador
    const assignedTasksCount = await TaskModel.countDocuments({
      status: "En Progreso",
      assigned_operator: operatorId,
    });

    return res.json({
      ok: true,
      counts: {
        totalNewReports,
        inProcess: inProcessCount,
        completed: completedCount,
        rejected: rejectedCount,
        activeCrews: activeCrewsCount,
        assignedTasks: assignedTasksCount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* DASHBOARD PARA ADMINISTRADORES
//* ============================================

/**
 * Dashboard del Administrador
 * @description Muestra estadísticas generales del sistema
 * @route GET /api/dashboard/admin
 * @access Administradores autenticados
 */
export const getAdminDashboard = async (req, res) => {
  try {
    //? Total de usuarios activos (no eliminados)
    const totalUsers = await UserModel.countDocuments({ deleted_at: null });

    //? Total de reportes en el sistema
    const totalReports = await ReportModel.countDocuments({});

    //? Reportes nuevos (pendientes de asignar)
    const newReports = await ReportModel.countDocuments({
      status: "Pendiente",
    });

    //? Reportes completados en el sistema
    const completedReports = await ReportModel.countDocuments({
      status: "Completado",
    });

    //? Total de trabajadores activos
    const activeWorkers = await UserModel.countDocuments({
      role: "Trabajador",
      deleted_at: null,
    });

    //? Total de operadores activos
    const activeOperators = await UserModel.countDocuments({
      role: "Operador",
      deleted_at: null,
    });

    //? Total de tareas en el sistema
    const totalTasks = await TaskModel.countDocuments({});

    //? Total de tareas completadas
    const totalCompletedTasks = await TaskModel.countDocuments({
      status: "Finalizada",
    });

    //? Cálculo de tasa de eficiencia (% de tareas completadas)
    // Formula: (tareas completadas / total de tareas) * 100
    const efficiencyRate =
      totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

    return res.json({
      ok: true,
      counts: {
        totalUsers,
        totalReports,
        newReports,
        completedReports,
        activeWorkers,
        activeOperators,
        efficiencyRate,
      },
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
// getDashboardCitizen = obtener dashboard de ciudadano
// getDashboardWorker = obtener dashboard de trabajador
// getOperatorDashboard = obtener dashboard de operador
// getAdminDashboard = obtener dashboard de administrador
// authorId = ID del autor (ciudadano)
// workerId = ID del trabajador
// operatorId = ID del operador
// countDocuments = contar documentos (operación de MongoDB)
// completedCount = conteo de completados
// acceptedCount = conteo de aceptados
// pendingCount = conteo de pendientes
// reviewedCount = conteo de revisados
// rejectedCount = conteo de rechazados
// totalCount = conteo total
// inProgressCount = conteo en progreso
// totalNewReports = total de reportes nuevos
// activeCrewsCount = conteo de cuadrillas activas
// assignedTasksCount = conteo de tareas asignadas
// efficiencyRate = tasa de eficiencia
// deleted_at = fecha de eliminación (soft delete)
// $or = operador OR de MongoDB (busca si cumple una u otra condición)

//* ============================================
//* CONTROLADOR DE ESTADÍSTICAS (GRÁFICOS)
//* ============================================
//? Este controlador proporciona datos para gráficos avanzados usando agregaciones de MongoDB
//? Incluye estadísticas para administradores (todo el sistema) y operadores (solo sus reportes)

//! IMPORTS DE MODELOS
import ReportModel from "../models/report.model.js";
import UserModel from "../models/user.model.js";

//* ============================================
//* CONSTANTES
//* ============================================

//? Array de nombres de meses en español (para gráficos de línea)
const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

//? Tipos de reportes disponibles en el sistema
const TIPOS_REPORTE = ["Bache", "Alumbrado", "Basura", "Otro"];

//* ============================================
//* FUNCIONES AUXILIARES PARA ADMINISTRADOR
//* ============================================

/**
 * Obtiene conteo de usuarios por rol (Gráfico de Barras)
 * @returns {Object} Conteo de Ciudadano, Operador, Trabajador, Administrador
 */
const getChartBarData = async () => {
  //? Contar usuarios por cada rol
  const citizenCount = await UserModel.countDocuments({ role: "Ciudadano" });
  const operatorCount = await UserModel.countDocuments({ role: "Operador" });
  const workerCount = await UserModel.countDocuments({ role: "Trabajador" });
  const adminCount = await UserModel.countDocuments({ role: "Administrador" });

  return {
    Ciudadano: citizenCount,
    Operador: operatorCount,
    Trabajador: workerCount,
    Administrador: adminCount,
  };
};

/**
 * Obtiene conteo de reportes por estado (Gráfico de Dona)
 * @description Cuenta TODOS los reportes del sistema agrupados por status
 * @returns {Object} Conteo de Pendiente, Revisado, Aceptado, Completado, Rechazado
 */
const getChartDoughnutData = async () => {
  const pendingCount = await ReportModel.countDocuments({
    status: "Pendiente",
  });
  const viewCount = await ReportModel.countDocuments({ status: "Revisado" });
  const acceptedCount = await ReportModel.countDocuments({
    status: "Aceptado",
  });
  const completeCount = await ReportModel.countDocuments({
    status: "Completado",
  });
  const rejectCount = await ReportModel.countDocuments({ status: "Rechazado" });

  return {
    Pendiente: pendingCount,
    Revisado: viewCount,
    Aceptado: acceptedCount,
    Completado: completeCount,
    Rechazado: rejectCount,
  };
};

/**
 * Obtiene reportes aceptados y completados por mes (Gráfico de Líneas)
 * @description Usa agregaciones de MongoDB para agrupar reportes por mes
 * @param {Number} year - Año para filtrar los datos
 * @returns {Object} Arrays con conteo de reportes aceptados y completados por mes
 */
const getChartLineReportsPerYearData = async (year) => {
  //? Agregación: Reportes aceptados por mes
  // $match filtra por status y rango de fechas
  // $group agrupa por mes ($month extrae el mes de approved_at)
  // $sort ordena por mes
  const acceptedByMonth = await ReportModel.aggregate([
    {
      $match: {
        status: "Aceptado",
        approved_at: {
          $ne: null,
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31T23:59:59`),
        },
      },
    },
    { $group: { _id: { $month: "$approved_at" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  //? Agregación: Reportes completados por mes
  const completedByMonth = await ReportModel.aggregate([
    {
      $match: {
        status: "Completado",
        completed_at: {
          $ne: null,
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31T23:59:59`),
        },
      },
    },
    { $group: { _id: { $month: "$completed_at" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  //? Inicializar arrays con 0 para todos los 12 meses
  const monthsAccepted = Array(12).fill(0);
  const monthsCompleted = Array(12).fill(0);

  //? Llenar datos de reportes aceptados (índice mes-1 porque los meses van de 1-12)
  acceptedByMonth.forEach((item) => {
    monthsAccepted[item._id - 1] = item.count;
  });

  //? Llenar datos de reportes completados
  completedByMonth.forEach((item) => {
    monthsCompleted[item._id - 1] = item.count;
  });

  return {
    year,
    months: MESES,
    Aceptado: monthsAccepted,
    Completado: monthsCompleted,
  };
};

/**
 * Obtiene reportes por tipo por mes (Gráfico de Líneas por Tipo)
 * @description Agrupa reportes por tipo (Bache, Alumbrado, Basura, Otro) y mes
 * @param {Number} year - Año para filtrar los datos
 * @returns {Object} Arrays con conteo de cada tipo de reporte por mes
 */
const getChartLineReportTypesData = async (year) => {
  const chartLineReportTypesData = {
    year,
    months: MESES,
  };

  //? Por cada tipo de reporte, obtener conteo por mes
  for (const reportType of TIPOS_REPORTE) {
    //? Agregación: Reportes de este tipo por mes
    const dataByMonth = await ReportModel.aggregate([
      {
        $match: {
          report_type: reportType,
          created_at: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59`),
          },
        },
      },
      { $group: { _id: { $month: "$created_at" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    //? Inicializar array con 0 para todos los 12 meses
    const monthsData = Array(12).fill(0);

    //? Llenar datos del tipo de reporte
    dataByMonth.forEach((item) => {
      monthsData[item._id - 1] = item.count;
    });

    chartLineReportTypesData[reportType] = monthsData;
  }

  return chartLineReportTypesData;
};

//* ============================================
//* FUNCIONES AUXILIARES PARA OPERADOR
//* ============================================

/**
 * Obtiene conteo de reportes por estado del operador (Gráfico de Dona)
 * @description Cuenta SOLO los reportes asignados al operador específico
 * @param {ObjectId} operatorId - ID del operador
 * @returns {Object} Conteo de Pendiente, Revisado, Aceptado, Completado, Rechazado
 */
const getChartDoughnutDataOperator = async (operatorId) => {
  //! Los pendientes NO se cuentan porque aún no están asignados a ningún operador
  const pendingCount = 0;

  const viewCount = await ReportModel.countDocuments({
    status: "Revisado",
    assigned_operator: operatorId,
  });

  const acceptedCount = await ReportModel.countDocuments({
    status: "Aceptado",
    assigned_operator: operatorId,
  });

  const completeCount = await ReportModel.countDocuments({
    status: "Completado",
    assigned_operator: operatorId,
  });

  const rejectCount = await ReportModel.countDocuments({
    status: "Rechazado",
    assigned_operator: operatorId,
  });

  return {
    Pendiente: pendingCount,
    Revisado: viewCount,
    Aceptado: acceptedCount,
    Completado: completeCount,
    Rechazado: rejectCount,
  };
};

/**
 * Obtiene reportes aceptados y completados por mes del operador (Gráfico de Líneas)
 * @description Usa agregaciones para contar SOLO reportes del operador específico
 * @param {ObjectId} operatorId - ID del operador
 * @param {Number} year - Año para filtrar los datos
 * @returns {Object} Arrays con conteo de reportes aceptados y completados por mes del operador
 */
const getChartLineReportsPerYearDataOperator = async (operatorId, year) => {
  //? Agregación: Reportes aceptados por mes del operador
  const acceptedByMonth = await ReportModel.aggregate([
    {
      $match: {
        status: "Aceptado",
        approved_at: {
          $ne: null,
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31T23:59:59`),
        },
        assigned_operator: operatorId, //! Filtro por operador
      },
    },
    { $group: { _id: { $month: "$approved_at" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  //? Agregación: Reportes completados por mes del operador
  const completedByMonth = await ReportModel.aggregate([
    {
      $match: {
        status: "Completado",
        completed_at: {
          $ne: null,
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31T23:59:59`),
        },
        assigned_operator: operatorId, //! Filtro por operador
      },
    },
    { $group: { _id: { $month: "$completed_at" }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  //? Inicializar arrays con 0 para todos los 12 meses
  const monthsAccepted = Array(12).fill(0);
  const monthsCompleted = Array(12).fill(0);

  //? Llenar datos de reportes aceptados
  acceptedByMonth.forEach((item) => {
    monthsAccepted[item._id - 1] = item.count;
  });

  //? Llenar datos de reportes completados
  completedByMonth.forEach((item) => {
    monthsCompleted[item._id - 1] = item.count;
  });

  return {
    year,
    months: MESES,
    Aceptado: monthsAccepted,
    Completado: monthsCompleted,
  };
};

/**
 * Obtiene reportes por tipo por mes del operador (Gráfico de Líneas por Tipo)
 * @description Agrupa reportes SOLO del operador por tipo y mes
 * @param {ObjectId} operatorId - ID del operador
 * @param {Number} year - Año para filtrar los datos
 * @returns {Object} Arrays con conteo de cada tipo de reporte por mes del operador
 */
const getChartLineReportTypesDataOperator = async (operatorId, year) => {
  const chartLineReportTypesData = {
    year,
    months: MESES,
  };

  //? Por cada tipo de reporte, obtener conteo por mes del operador
  for (const reportType of TIPOS_REPORTE) {
    const dataByMonth = await ReportModel.aggregate([
      {
        $match: {
          report_type: reportType,
          created_at: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31T23:59:59`),
          },
          assigned_operator: operatorId, //! Filtro por operador
        },
      },
      { $group: { _id: { $month: "$created_at" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    //? Inicializar array con 0 para todos los 12 meses
    const monthsData = Array(12).fill(0);

    //? Llenar datos del tipo de reporte
    dataByMonth.forEach((item) => {
      monthsData[item._id - 1] = item.count;
    });

    chartLineReportTypesData[reportType] = monthsData;
  }

  return chartLineReportTypesData;
};

//* ============================================
//* ENDPOINTS PRINCIPALES
//* ============================================

/**
 * Obtiene estadísticas para el Operador
 * @description Solo muestra datos de reportes asignados a este operador
 * @route GET /api/operator/statistics
 * @access Operadores autenticados
 */
export const getOperatorStatistics = async (req, res) => {
  try {
    const operatorId = req.user._id; //? ID del operador logueado

    //? Obtener año de los query params, o usar año actual
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    //? Obtener datos de gráficos usando las funciones auxiliares
    const chartDoughnutData = await getChartDoughnutDataOperator(operatorId);
    const chartLineReportsData = await getChartLineReportsPerYearDataOperator(
      operatorId,
      year
    );
    const chartLineReportTypesData = await getChartLineReportTypesDataOperator(
      operatorId,
      year
    );

    return res.status(200).json({
      ok: true,
      data: {
        chartDoughnutData, //? Reportes por estado
        chartLineReportsData, //? Reportes aceptados/completados por mes
        chartLineReportTypesData, //? Reportes por tipo por mes
      },
    });
  } catch (error) {
    console.error("Error en getOperatorStatistics:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

/**
 * Obtiene estadísticas para el Administrador
 * @description Muestra datos de TODOS los reportes del sistema
 * @route GET /api/admin/statistics
 * @access Administradores autenticados
 */
export const getAdminStatistics = async (req, res) => {
  try {
    //? Obtener año de los query params, o usar año actual
    const year = req.query.year
      ? parseInt(req.query.year)
      : new Date().getFullYear();

    //? Obtener datos de gráficos usando las funciones auxiliares
    const chartBarData = await getChartBarData(); //? Usuarios por rol
    const chartDoughnutData = await getChartDoughnutData(); //? Reportes por estado
    const chartLineReportsData = await getChartLineReportsPerYearData(year); //? Reportes por mes
    const chartLineReportTypesData = await getChartLineReportTypesData(year); //? Reportes por tipo por mes

    return res.status(200).json({
      ok: true,
      data: {
        chartBarData, //? Gráfico de barras: usuarios por rol
        chartDoughnutData, //? Gráfico de dona: reportes por estado
        chartLineReportsData, //? Gráfico de líneas: reportes aceptados/completados por mes
        chartLineReportTypesData, //? Gráfico de líneas: reportes por tipo por mes
      },
    });
  } catch (error) {
    console.error("Error en getAdminStatistics:", error);
    return res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// getOperatorStatistics = obtener estadísticas del operador
// getAdminStatistics = obtener estadísticas del administrador
// MESES = array de nombres de meses en español
// TIPOS_REPORTE = tipos de reportes del sistema
// getChartBarData = obtener datos para gráfico de barras
// getChartDoughnutData = obtener datos para gráfico de dona
// getChartLineReportsPerYearData = obtener datos de reportes por año para gráfico de líneas
// getChartLineReportTypesData = obtener datos de tipos de reportes para gráfico de líneas
// aggregate = agregación (operación de MongoDB para agrupar y transformar datos)
// $match = filtrar documentos
// $group = agrupar documentos
// $month = extraer mes de una fecha
// $sum = sumar valores
// $sort = ordenar resultados
// $ne = no es igual (not equal)
// $gte = mayor o igual que (greater than or equal)
// $lte = menor o igual que (less than or equal)
// assigned_operator = operador asignado
// approved_at = fecha de aprobación
// completed_at = fecha de completado
// created_at = fecha de creación
// Array.fill(0) = llenar array con ceros
// chartBarData = datos para gráfico de barras
// chartDoughnutData = datos para gráfico de dona
// chartLineReportsData = datos para gráfico de líneas de reportes
// chartLineReportTypesData = datos para gráfico de líneas de tipos de reportes

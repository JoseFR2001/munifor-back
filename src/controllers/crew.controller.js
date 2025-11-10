//* ============================================
//* CONTROLADOR DE CUADRILLAS (CREWS)
//* ============================================

//! IMPORT DE MODELO
import CrewModel from "../models/crew.model.js";

//* ============================================
//* CREAR CUADRILLA
//* ============================================

/**
 * Crea una nueva cuadrilla/equipo de trabajo
 * Body esperado: { name, leader, members[] }
 */
export const createCrew = async (req, res) => {
  try {
    //? Crear nueva cuadrilla con los datos del body
    const newCrew = await CrewModel.create(req.body);

    //* Respuesta exitosa con la cuadrilla creada
    return res.status(201).json({
      ok: true,
      crew: newCrew,
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
//* OBTENER TODAS LAS CUADRILLAS
//* ============================================

/**
 * Obtiene todas las cuadrillas del sistema
 * Incluye información del líder y miembros mediante populate
 */
export const getAllCrews = async (req, res) => {
  try {
    //? Buscar todas las cuadrillas y poblar referencias
    const crews = await CrewModel.find()
      .populate("leader", "username") // Incluye solo el username del líder
      .populate("members", "username"); // Incluye solo el username de los miembros

    //* Respuesta exitosa con lista de cuadrillas
    return res.status(200).json({
      ok: true,
      crews,
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
//* OBTENER CUADRILLA DE UN TRABAJADOR
//* ============================================

/**
 * Obtiene la cuadrilla actual y pasadas de un trabajador
 * Busca si el trabajador es líder o miembro
 */
export const getCrewByWorker = async (req, res) => {
  const workerId = req.user._id; // ID del trabajador autenticado
  try {
    //? Buscar cuadrilla actual donde el trabajador es miembro o líder
    // $or: busca en múltiples condiciones (es miembro OR es líder)
    const currentCrew = await CrewModel.findOne({
      $or: [{ members: workerId }, { leader: workerId }],
    })
      .populate("leader", "username")
      .populate("members", "username");

    //? Buscar cuadrillas pasadas (deleted_at != null)
    const pastCrews = await CrewModel.findOne({
      $or: [{ members: workerId }, { leader: workerId }],
      deleted_at: { $ne: null }, // $ne = Not Equal (no es null)
    })
      .populate("leader", "username")
      .populate("members", "username");

    //* Respuesta con cuadrilla actual y pasadas
    return res.status(200).json({
      ok: true,
      crew: currentCrew,
      pastCrews,
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
//* OBTENER CUADRILLA POR ID
//* ============================================

/**
 * Obtiene una cuadrilla específica por su ID
 */
export const getCrewById = async (req, res) => {
  const { id } = req.params;
  try {
    //? Buscar cuadrilla por ID
    const crew = await CrewModel.findById(id);

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      crew,
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
//* OBTENER CUADRILLA DE UN MIEMBRO ESPECÍFICO
//* ============================================

/**
 * Obtiene la cuadrilla donde un miembro específico está asignado
 * TODO: Modificar para usar req.user._id en lugar de req.params.memberId
 */
export const getCrewWorker = async (req, res) => {
  const { memberId } = req.params;
  // ! Debo modificar esto para que tome el id del user logueado
  try {
    //? Buscar cuadrilla donde el memberId está en el array members
    const crew = await CrewModel.findOne({ members: memberId });

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      crew,
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
//* ACTUALIZAR CUADRILLA
//* ============================================

/**
 * Actualiza los datos de una cuadrilla
 * Puede actualizar: name, leader, members[]
 */
export const updateCrew = async (req, res) => {
  const { id } = req.params;
  try {
    //? Actualizar cuadrilla con nuevos datos
    const updatedCrew = await CrewModel.findByIdAndUpdate(id, req.body, {
      new: true, // Devuelve el documento actualizado
    });

    //* Respuesta exitosa con cuadrilla actualizada
    return res.status(200).json({
      ok: true,
      crew: updatedCrew,
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
//* ELIMINAR CUADRILLA (HARD DELETE)
//* ============================================

/**
 * Elimina permanentemente una cuadrilla de la base de datos
 * NOTA: Esto es hard delete, no soft delete
 * TODO: Considerar cambiar a soft delete usando deleted_at
 */
export const deleteCrew = async (req, res) => {
  const { id } = req.params;
  try {
    //? Eliminar cuadrilla permanentemente
    await CrewModel.findByIdAndDelete(id);

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      msg: "Crew deleted successfully",
    });
  } catch (error) {
    //! Error del servidor
    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// crew = cuadrilla/equipo de trabajo
// createCrew = crear cuadrilla
// getAllCrews = obtener todas las cuadrillas
// getCrewByWorker = obtener cuadrilla del trabajador
// getCrewById = obtener cuadrilla por ID
// getCrewWorker = obtener cuadrilla de un miembro
// updateCrew = actualizar cuadrilla
// deleteCrew = eliminar cuadrilla
// leader = líder/jefe de cuadrilla
// members = miembros del equipo
// workerId = ID del trabajador
// currentCrew = cuadrilla actual
// pastCrews = cuadrillas pasadas
// populate = poblar/incluir datos de referencia
// $or = operador OR de MongoDB (una condición u otra)
// $ne = operador Not Equal de MongoDB (no igual a)
// deleted_at = fecha de eliminación
// findByIdAndUpdate = buscar por ID y actualizar
// findByIdAndDelete = buscar por ID y eliminar

//* ============================================
//* CONTROLADOR DE USUARIOS
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import UserModel from "../models/user.model.js";
import fs from "fs"; // Sistema de archivos (para eliminar imágenes)
import path from "path"; // Manejo de rutas de archivos
import { fileURLToPath } from "url"; // Conversión de URL a ruta

//* CONFIGURACIÓN DE __dirname PARA MÓDULOS ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* ============================================
//* OBTENER USUARIO POR ID
//* ============================================

/**
 * Obtiene un usuario específico por su ID
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    //? Buscar usuario por ID
    const user = await UserModel.findById(id);

    //* Respuesta exitosa con el usuario
    return res.status(200).json({
      ok: true,
      user,
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
//* OBTENER TODOS LOS TRABAJADORES
//* ============================================

/**
 * Obtiene todos los usuarios con role "Trabajador"
 * Útil para asignar trabajadores a cuadrillas
 */
export const getWorkers = async (req, res) => {
  try {
    //? Filtrar usuarios por role "Trabajador"
    const workers = await UserModel.find({ role: "Trabajador" });

    //* Respuesta exitosa con lista de trabajadores
    return res.status(200).json({
      ok: true,
      workers,
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
//* ACTIVAR USUARIO (ADMINISTRADOR)
//* ============================================

/**
 * Activa un usuario (cambia is_active a true)
 * Solo el administrador puede hacer esto
 */
export const putIsActiveUser = async (req, res) => {
  const { id } = req.params;
  try {
    //? Actualizar is_active a true
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true } // Devuelve el documento actualizado
    );

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      user: updatedUser,
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
//* RECHAZAR USUARIO (SOFT DELETE)
//* ============================================

/**
 * Rechaza/elimina un usuario usando soft delete
 * Establece deleted_at a la fecha actual
 */
export const rejectUser = async (req, res) => {
  const { id } = req.params;
  try {
    //? Soft delete: establece deleted_at a fecha actual
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    );

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      user: updatedUser,
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
//* OBTENER USUARIOS PENDIENTES DE APROBACIÓN
//* ============================================

/**
 * Obtiene usuarios que están esperando ser activados
 * Filtra: is_active = false y deleted_at = null
 */
export const getPendingUsers = async (req, res) => {
  try {
    //? Buscar usuarios no activados y no eliminados
    const pendingUsers = await UserModel.find({
      is_active: false,
      deleted_at: null,
    });

    //* Respuesta exitosa con usuarios pendientes
    return res.status(200).json({
      ok: true,
      users: pendingUsers,
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
//* CAMBIAR DISPONIBILIDAD DE TRABAJADOR
//* ============================================

/**
 * Cambia el estado is_available del trabajador
 * Se usa cuando un trabajador es asignado/removido de un crew
 */
export const putIsAvailableUser = async (req, res) => {
  const { id } = req.params;
  try {
    //? Toggle de is_available (invierte el valor actual)
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { is_available: !req.body.is_available }, // Toggle o usar req.body.is_available
      { new: true }
    );

    //* Respuesta exitosa
    return res.status(200).json({
      ok: true,
      user: updatedUser,
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
//* ACTUALIZAR FOTO DE PERFIL (MULTER)
//* ============================================

/**
 * Actualiza la foto de perfil del usuario
 * - Elimina la foto anterior si existe
 * - Guarda la nueva foto con Multer
 * - Actualiza la ruta en la base de datos
 */
export const updateProfilePicture = async (req, res) => {
  const { id } = req.params;
  try {
    //! Validar que se haya enviado un archivo
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        msg: "No se ha enviado ninguna imagen",
      });
    }

    //? Obtener usuario actual para eliminar imagen anterior
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }

    //? Eliminar imagen anterior si existe
    if (user.profile_picture) {
      // Construir ruta completa de la imagen anterior
      const oldImagePath = path.join(__dirname, "../../", user.profile_picture);

      // Verificar si el archivo existe antes de eliminarlo
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Eliminar archivo del sistema
      }
    }

    //? Guardar nueva ruta de imagen en la base de datos
    // req.file.filename viene de Multer después de guardar el archivo
    const imagePath = `uploads/profiles/${req.file.filename}`;
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { profile_picture: imagePath },
      { new: true }
    );

    //* Respuesta exitosa con URL completa de la imagen
    return res.status(200).json({
      ok: true,
      user: updatedUser,
      imageUrl: `${req.protocol}://${req.get("host")}/${imagePath}`, // URL completa para el frontend
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
// getUserById = obtener usuario por ID
// getWorkers = obtener trabajadores
// putIsActiveUser = activar usuario
// rejectUser = rechazar usuario
// getPendingUsers = obtener usuarios pendientes
// putIsAvailableUser = cambiar disponibilidad del usuario
// updateProfilePicture = actualizar foto de perfil
// is_active = está activo
// is_available = está disponible
// deleted_at = eliminado en (fecha)
// workers = trabajadores
// pendingUsers = usuarios pendientes
// updatedUser = usuario actualizado
// imagePath = ruta de la imagen
// oldImagePath = ruta de la imagen anterior
// imageUrl = URL de la imagen
// fs.existsSync() = verificar si archivo existe
// fs.unlinkSync() = eliminar archivo

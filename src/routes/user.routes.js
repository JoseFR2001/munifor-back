//* ============================================
//* RUTAS DE USUARIOS
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express";

//! IMPORTS DE CONTROLADORES
import {
  getUserById,
  getWorkers,
  getPendingUsers,
  rejectUser,
  putIsActiveUser,
  putIsAvailableUser,
  updateProfilePicture,
} from "../controllers/user.controller.js";

//! IMPORTS DE MIDDLEWARES (MULTER)
import { uploadProfilePicture } from "../config/multer.js";

//* CREACIÓN DEL ROUTER
const userRoutes = Router();

//* ============================================
//* DEFINICIÓN DE RUTAS
//* ============================================

//? GET /api/user/workers - Obtener lista de trabajadores
// Filtra usuarios con role: "Worker"
// Para asignar a cuadrillas
// Responde: { ok, workers[] }
userRoutes.get("/user/workers", getWorkers);

//? GET /api/user/pending - Obtener usuarios pendientes de aprobación
// Filtra usuarios con is_active: false y no rechazados
// Para que admin apruebe registros
// Responde: { ok, pendingUsers[] }
userRoutes.get("/user/pending", getPendingUsers);

//? PUT /api/user/reject/:id - Rechazar usuario pendiente
// Marca usuario como rechazado (rejected: true o similar)
// Params: id
// Responde: { ok, msg, user }
userRoutes.put("/user/reject/:id", rejectUser);

//? PUT /api/user/activate/:id - Activar/aprobar usuario
// Cambia is_active a true
// Aprueba el registro de un nuevo usuario
// Params: id
// Responde: { ok, msg, user }
userRoutes.put("/user/activate/:id", putIsActiveUser);

//? PUT /api/user/available/:id - Cambiar disponibilidad de trabajador
// Cambia is_available (true/false)
// Para indicar si un trabajador está disponible para asignarse a cuadrillas
// Params: id
// Responde: { ok, msg, user }
userRoutes.put("/user/available/:id", putIsAvailableUser);

//? PUT /api/user/profile-picture/:id - Actualizar foto de perfil
// Usa Multer para subir imagen a uploads/profiles/
// Middleware uploadProfilePicture maneja el archivo
// Params: id
// Body (multipart/form-data): profile_picture (file)
// Responde: { ok, msg, user }
userRoutes.put(
  "/user/profile-picture/:id",
  uploadProfilePicture,
  updateProfilePicture
);

//? GET /api/user/:id - Obtener usuario por ID
// Params: id
// Responde: { ok, user }
userRoutes.get("/user/:id", getUserById);

//* EXPORTAR EL ROUTER
export default userRoutes;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// userRoutes = enrutador de usuarios
// getWorkers = obtener trabajadores
// getPendingUsers = obtener usuarios pendientes
// rejectUser = rechazar usuario
// putIsActiveUser = activar usuario (poner is_active en true)
// putIsAvailableUser = cambiar disponibilidad del usuario
// updateProfilePicture = actualizar foto de perfil
// getUserById = obtener usuario por ID
// uploadProfilePicture = middleware de Multer para subir foto de perfil
// workers = trabajadores
// pending = pendiente
// activate = activar
// available = disponible
// rejected = rechazado

//* ============================================
//* RUTAS DE CUADRILLAS (CREWS)
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express";

//! IMPORTS DE CONTROLADORES
import {
  createCrew,
  deleteCrew,
  getAllCrews,
  getCrewById,
  getCrewByWorker,
  updateCrew,
} from "../controllers/crew.controller.js";

//* CREACIÓN DEL ROUTER
const crewRouter = Router();

//* ============================================
//* DEFINICIÓN DE RUTAS
//* ============================================

//? POST /api/crew - Crear nueva cuadrilla
// Body: { name, leader, members[] }
// Responde: { ok, crew }
crewRouter.post("/crew", createCrew);

//? GET /api/crews - Obtener todas las cuadrillas
// Incluye populate de leader y members
// Responde: { ok, crews[] }
crewRouter.get("/crews", getAllCrews);

//? GET /api/crew/worker - Obtener cuadrilla del trabajador autenticado
// Usa req.user._id del middleware de autenticación
// Responde: { ok, crew, pastCrews }
crewRouter.get("/crew/worker", getCrewByWorker);

//? GET /api/crew/:id - Obtener cuadrilla por ID
// Params: id
// Responde: { ok, crew }
crewRouter.get("/crew/:id", getCrewById);

//? PUT /api/crew/:id - Actualizar cuadrilla
// Params: id
// Body: { name?, leader?, members[]? }
// Responde: { ok, crew }
crewRouter.put("/crew/:id", updateCrew);

//? DELETE /api/crew/:id - Eliminar cuadrilla (hard delete)
// Params: id
// Responde: { ok, msg }
crewRouter.delete("/crew/:id", deleteCrew);

//* EXPORTAR EL ROUTER
export default crewRouter;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// crewRouter = enrutador de cuadrillas
// createCrew = crear cuadrilla
// getAllCrews = obtener todas las cuadrillas
// getCrewByWorker = obtener cuadrilla del trabajador
// getCrewById = obtener cuadrilla por ID
// updateCrew = actualizar cuadrilla
// deleteCrew = eliminar cuadrilla
// POST = crear nuevo recurso
// GET = obtener recursos
// PUT = actualizar recurso completo
// DELETE = eliminar recurso

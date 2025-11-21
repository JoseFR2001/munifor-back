//* ============================================
//* RUTAS DE MAPA (DATOS GEOGRÁFICOS)
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express";

//! IMPORTS DE CONTROLADORES
import {
  getMapaData,
  getMapaOperatorData,
} from "../controllers/map.controller.js";

//* CREACIÓN DEL ROUTER
const mapRoutes = Router();

//* ============================================
//* DEFINICIÓN DE RUTAS - DATOS PARA MAPAS
//* ============================================

//? GET /api/map/data - Obtener datos de mapa (vista admin/general)
// Retorna TODOS los reportes, tareas y reportes de progreso
// Con sus coordenadas (location.lat, location.lng)
// Para mostrar marcadores en el mapa
// Responde: { ok, reports[], tasks[], progress[] }
mapRoutes.get("/map/data", getMapaData);

//? GET /api/map/operator-data - Obtener datos de mapa del operador
// Filtra SOLO reportes, tareas y reportes de progreso del operador logueado
// Usa req.user._id para filtrar por assigned_operator
// Para que el operador vea solo sus asignaciones en el mapa
// Responde: { ok, reports[], tasks[], progress[] }
mapRoutes.get("/map/operator-data", getMapaOperatorData);

//* EXPORTAR EL ROUTER
export default mapRoutes;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// mapRoutes = enrutador de mapa
// getMapaData = obtener datos del mapa (general)
// getMapaOperatorData = obtener datos del mapa del operador
// location.lat = latitud de la ubicación
// location.lng = longitud de la ubicación
// markers = marcadores (puntos en el mapa)

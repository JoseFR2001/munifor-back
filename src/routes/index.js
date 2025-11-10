//* ============================================
//* ROUTER PRINCIPAL - AGRUPA TODAS LAS RUTAS
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express"; // Router de Express

//! IMPORTS DE ROUTERS INDIVIDUALES
import authRoutes from "./auth.routes.js"; // Rutas de autenticación (login, register, etc.)
import crewRouter from "./crew.routes.js"; // Rutas de cuadrillas
import taskRouter from "./task.routes.js"; // Rutas de tareas
import reportRouter from "./report.route.js"; // Rutas de reportes
import routerProgress from "./progress_report.routes.js"; // Rutas de avances
import userRoutes from "./user.routes.js"; // Rutas de usuarios
import dashboardRouter from "./dashboard.routes.js"; // Rutas de dashboard
import statisticsRoutes from "./statistics.routes.js"; // Rutas de estadísticas
import mapRoutes from "./map.routes.js"; // Rutas de mapas

//! IMPORTS DE MIDDLEWARES
import { authMiddleware } from "../middlewares/auth.middleware.js"; // Middleware de autenticación JWT

//* CREACIÓN DEL ROUTER PRINCIPAL
const router = Router();

//* ============================================
//* RUTAS PÚBLICAS (NO REQUIEREN AUTENTICACIÓN)
//* ============================================

//? Rutas de autenticación: register, login, logout
// Estas rutas son públicas porque no se puede pedir token si aún no se ha hecho login
router.use(authRoutes);

//* ============================================
//* MIDDLEWARE DE AUTENTICACIÓN GLOBAL
//* ============================================

//! Todas las rutas declaradas DESPUÉS de esta línea requieren autenticación
// authMiddleware verifica el token JWT en el header "Authorization"
// Si el token es inválido o no existe, devuelve 401 Unauthorized
router.use(authMiddleware);

//* ============================================
//* RUTAS PROTEGIDAS (REQUIEREN TOKEN JWT)
//* ============================================

//? Rutas de cuadrillas/equipos
router.use(crewRouter);

//? Rutas de tareas
router.use(taskRouter);

//? Rutas de reportes ciudadanos
router.use(reportRouter);

//? Rutas de avances/progress reports
router.use(routerProgress);

//? Rutas de usuarios (CRUD usuarios, activar, etc.)
router.use(userRoutes);

//? Rutas de dashboard (resúmenes por rol)
router.use(dashboardRouter);

//? Rutas de mapas (ubicaciones geográficas)
router.use(mapRoutes);

//? Rutas de estadísticas (gráficos, métricas)
router.use(statisticsRoutes);

//* EXPORTAR EL ROUTER PRINCIPAL
export default router;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// router = enrutador principal
// authRoutes = rutas de autenticación
// crewRouter = enrutador de cuadrillas
// taskRouter = enrutador de tareas
// reportRouter = enrutador de reportes
// routerProgress = enrutador de avances
// userRoutes = rutas de usuarios
// dashboardRouter = enrutador de dashboard
// statisticsRoutes = rutas de estadísticas
// mapRoutes = rutas de mapas
// authMiddleware = middleware de autenticación
// use = usar/aplicar middleware o router

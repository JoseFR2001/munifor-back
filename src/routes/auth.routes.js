//* ============================================
//* RUTAS DE AUTENTICACIÓN
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import { Router } from "express"; // Router de Express para definir rutas

//! IMPORTS DE CONTROLADORES
import {
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/auth.controller.js";

//! IMPORTS DE MIDDLEWARES
import { authMiddleware } from "../middlewares/auth.middleware.js";

//* CREACIÓN DEL ROUTER
const authRoutes = Router();

//* ============================================
//* DEFINICIÓN DE RUTAS
//* ============================================

//? POST /api/auth/register - Registrar nuevo usuario
// Público (no requiere autenticación)
// Body: { username, email, password, role, profile: {...} }
// Responde: { ok, msg, user }
authRoutes.post("/auth/register", register);

//? POST /api/auth/login - Iniciar sesión
// Público (no requiere autenticación)
// Body: { username, password }
// Responde: { ok, message, token }
authRoutes.post("/auth/login", login);

//? PUT /api/auth/update/profile - Actualizar perfil del usuario
// Protegido (requiere token JWT)
// Middleware: authMiddleware verifica el token antes de ejecutar updateProfile
// Body: { first_name, last_name, phone, age, address, sex }
// Responde: { ok, msg, user }
authRoutes.put("/auth/update/profile", authMiddleware, updateProfile);

//? POST /api/auth/logout - Cerrar sesión
// Público (solo limpia la cookie)
// En sistemas JWT stateless, el frontend debe eliminar el token
// Responde: { ok, msg }
authRoutes.post("/auth/logout", logout);

//* EXPORTAR EL ROUTER
export default authRoutes;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// Router = Enrutador (gestor de rutas)
// authRoutes = rutas de autenticación
// register = registrar
// login = iniciar sesión
// logout = cerrar sesión
// updateProfile = actualizar perfil
// authMiddleware = middleware de autenticación
// POST = método HTTP para crear recursos
// PUT = método HTTP para actualizar recursos
// /api/auth/* = prefijo de rutas de autenticación

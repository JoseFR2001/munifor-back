//* ============================================
//* HELPER DE JWT - TOKENS DE AUTENTICACIÓN
//* ============================================

//! IMPORT DE JSONWEBTOKEN
import jwt from "jsonwebtoken"; // Biblioteca para crear y verificar tokens JWT

//* ============================================
//* GENERAR TOKEN JWT
//* ============================================

/**
 * Genera un token JWT firmado con información del usuario
 * El token se envía al cliente y se usa para autenticar peticiones
 * @param {Object} payload - Datos a incluir en el token (ej: {_id, role})
 * @returns {string} - Token JWT firmado
 */
export const generateToken = (payload) => {
  try {
    //? jwt.sign() crea el token
    // - payload: datos que queremos incluir (NO incluir contraseñas)
    // - JWT_SECRET: clave secreta para firmar el token (desde .env)
    // - expiresIn: tiempo de validez del token (desde .env, ej: "1d" = 1 día)
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.EXPIRES, // Ejemplo: "1d", "24h", "7d"
    });
  } catch (error) {
    //! Error al generar el token
    throw new Error("Error generando el token: " + error.message);
  }
};

//* ============================================
//* VERIFICAR TOKEN JWT
//* ============================================

/**
 * Verifica que un token sea válido y no haya expirado
 * Extrae el payload del token si es válido
 * @param {string} token - Token JWT a verificar
 * @returns {Object} - Payload del token (datos del usuario)
 * @throws {Error} - Si el token es inválido o expiró
 */
export const verifyToken = (token) => {
  try {
    //? jwt.verify() verifica el token
    // - token: el token a verificar
    // - JWT_SECRET: misma clave secreta usada para firmarlo
    // Devuelve el payload si es válido
    // Lanza error si es inválido o expiró
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    //! Error al verificar (token inválido, expirado o manipulado)
    throw new Error("Error verificando el token: " + error.message);
  }
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// jwt = JSON Web Token (estándar de autenticación)
// generateToken = generar token
// verifyToken = verificar token
// payload = carga útil (datos incluidos en el token)
// JWT_SECRET = clave secreta para firmar tokens
// EXPIRES = tiempo de expiración del token
// expiresIn = expira en (duración de validez)
// sign = firmar (crear) un token
// verify = verificar un token
// token = token de autenticación

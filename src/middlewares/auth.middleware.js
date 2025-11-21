//* ============================================
//* MIDDLEWARE DE AUTENTICACIÓN - JWT
//* ============================================

//! IMPORT DEL HELPER DE JWT
import { verifyToken } from "../helpers/jwt.helper.js";

//* ============================================
//* MIDDLEWARE DE AUTENTICACIÓN
//* ============================================

/**
 * Middleware que verifica el token JWT en cada petición protegida
 * Extrae el usuario del token y lo añade a req.user
 *
 * Flujo:
 * 1. Extrae el token del header "Authorization"
 * 2. Verifica que el token sea válido
 * 3. Decodifica el payload (información del usuario)
 * 4. Añade los datos del usuario a req.user
 * 5. Permite que la petición continúe
 */
export const authMiddleware = (req, res, next) => {
  try {
    //? Extraer el header "Authorization" de la petición
    // Formato esperado: "Bearer <token>"
    const authHeader = req.headers["authorization"];

    //! Si no existe el header, la petición no está autenticada
    if (!authHeader) {
      return res.status(401).json({ msg: "No autenticado" });
    }

    //? Extraer solo el token (quitar "Bearer ")
    // Ejemplo: "Bearer abc123xyz" → ["Bearer", "abc123xyz"]
    // split(" ")[1] toma la segunda parte (el token)
    const token = authHeader.split(" ")[1];

    //! Si no hay token después de "Bearer "
    if (!token) {
      return res.status(401).json({ msg: "No autenticado" });
    }

    //? Verificar y decodificar el token usando el helper
    // Si el token es inválido o expiró, verifyToken lanza un error
    const decoded = verifyToken(token);

    //? Añadir la información del usuario a req.user
    // Ahora todos los controladores pueden acceder a req.user
    // que contiene: { _id, role }
    req.user = decoded;

    //? Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    //! Error al verificar el token (token inválido, expirado, manipulado)
    console.log(error.message);
    res.status(401).json({ msg: "Error interno del servidor" });
  }
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// authMiddleware = middleware de autenticación
// req = request (petición HTTP)
// res = response (respuesta HTTP)
// next = siguiente middleware/controlador
// authHeader = cabecera de autenticación
// authorization = autorización
// headers = cabeceras HTTP
// token = token de autenticación
// split = dividir/separar string
// decoded = decodificado (información extraída del token)
// verifyToken = verificar token
// req.user = usuario autenticado (disponible en controladores)
// 401 = código HTTP Unauthorized (no autenticado)

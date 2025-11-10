//* ============================================
//* MIDDLEWARE DE VALIDACIÓN - EXPRESS-VALIDATOR
//* ============================================

//! IMPORT DE EXPRESS-VALIDATOR
import { validationResult } from "express-validator";

//* ============================================
//* MIDDLEWARE PARA APLICAR VALIDACIONES
//* ============================================

/**
 * Middleware que verifica los resultados de las validaciones
 * Se usa después de las reglas de validación definidas en validations/
 *
 * Flujo:
 * 1. Recibe las reglas de validación de los middlewares anteriores
 * 2. Ejecuta validationResult() para ver si hay errores
 * 3. Si hay errores, devuelve 400 con lista de errores
 * 4. Si no hay errores, permite continuar
 *
 * Ejemplo de uso en rutas:
 * router.post('/login', loginValidation, applyValidation, login)
 */
export const applyValidation = async (req, res, next) => {
  //? Obtener el resultado de las validaciones
  // validationResult() revisa todos los errores acumulados por express-validator
  const result = validationResult(req);

  //? Si hay errores de validación
  if (!result.isEmpty()) {
    //! Devolver 400 Bad Request con lista de errores
    // result.array() convierte los errores a un array
    // Ejemplo: [{ field: "email", msg: "Email inválido" }]
    return res.status(400).json({ errors: result.array() });
  }

  //? Si no hay errores, continuar con el siguiente middleware/controlador
  next();
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// applyValidation = aplicar validación
// validationResult = resultado de validación
// result = resultado
// isEmpty = está vacío
// errors = errores
// array = arreglo/lista
// next = siguiente middleware
// 400 = código HTTP Bad Request (petición incorrecta)

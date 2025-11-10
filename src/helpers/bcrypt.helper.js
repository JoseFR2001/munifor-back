//* ============================================
//* HELPER DE BCRYPT - ENCRIPTACIÓN DE CONTRASEÑAS
//* ============================================

//! IMPORT DE BCRYPT
import bcrypt from "bcrypt"; // Biblioteca para hashear contraseñas de forma segura

//* ============================================
//* HASHEAR CONTRASEÑA
//* ============================================

/**
 * Convierte una contraseña en texto plano a un hash seguro
 * Usa bcrypt con 10 rondas de salt (equilibrio seguridad/velocidad)
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Contraseña hasheada
 */
export const hashPassword = async (password) => {
  //? Salt rounds: cantidad de veces que se aplica el algoritmo de hash
  // Más rondas = más seguro pero más lento
  // 10 es el valor recomendado (equilibrio entre seguridad y rendimiento)
  const saltRounds = 10;

  //? Generar hash de la contraseña
  // bcrypt genera un salt único automáticamente
  return await bcrypt.hash(password, saltRounds);
};

//* ============================================
//* COMPARAR CONTRASEÑA
//* ============================================

/**
 * Compara una contraseña en texto plano con un hash
 * Se usa en el login para verificar la contraseña
 * @param {string} password - Contraseña ingresada por el usuario
 * @param {string} hashedPassword - Hash guardado en la base de datos
 * @returns {Promise<boolean>} - true si coinciden, false si no
 */
export const comparePassword = async (password, hashedPassword) => {
  //? bcrypt.compare() compara de forma segura
  // Extrae el salt del hash y lo aplica a la password para comparar
  return await bcrypt.compare(password, hashedPassword);
};

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// bcrypt = Biblioteca de encriptación de contraseñas
// hashPassword = hashear/cifrar contraseña
// comparePassword = comparar contraseña
// saltRounds = rondas de salt (complejidad del hash)
// hash = función que genera el hash
// compare = función que compara password con hash
// password = contraseña en texto plano
// hashedPassword = contraseña hasheada/cifrada

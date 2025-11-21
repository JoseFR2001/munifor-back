//* ============================================
//* CONFIGURACIÓN DE BASE DE DATOS - MONGODB
//* ============================================

import mongoose from "mongoose"; // ODM (Object Document Mapper) para MongoDB

//* ============================================
//* FUNCIÓN DE INICIALIZACIÓN DE LA BASE DE DATOS
//* ============================================

/**
 * Función asíncrona que establece la conexión con MongoDB
 * @returns {Promise<void>} Promesa que se resuelve cuando se conecta exitosamente
 */
const initDb = async () => {
  try {
    //? Intenta conectarse a MongoDB usando la URI desde variables de entorno
    // MONGODB_URI debe estar definida en el archivo .env
    // Ejemplo: MONGODB_URI=mongodb://localhost:27017/munifor
    await mongoose.connect(process.env.MONGODB_URI);

    //* Mensaje de éxito en la consola
    console.log("Database connected");
  } catch (error) {
    //! Si hay un error en la conexión, lo muestra en consola
    // Esto puede suceder si MongoDB no está corriendo o la URI es incorrecta
    console.error("Database connection failed:", error);
  }
};

//? Exporta la función para usarla en app.js
export default initDb;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// initDb = Inicializar Base de Datos (Initialize Database)
// mongoose = Biblioteca ODM para trabajar con MongoDB
// MONGODB_URI = URI de conexión a MongoDB (dirección del servidor de base de datos)
// error = Error capturado durante la conexión

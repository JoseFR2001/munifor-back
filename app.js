//* ============================================
//* ARCHIVO PRINCIPAL - CONFIGURACIÓN DEL SERVIDOR EXPRESS
//* ============================================

//! IMPORTS DE DEPENDENCIAS PRINCIPALES
import "dotenv/config"; // Carga las variables de entorno desde el archivo .env
import express from "express"; // Framework web para Node.js
import cors from "cors"; // Middleware para permitir peticiones desde diferentes orígenes
import path from "path"; // Utilidad para trabajar con rutas de archivos y directorios
import { fileURLToPath } from "url"; // Convierte URL de módulo ES6 a ruta de archivo

//! IMPORTS DE CONFIGURACIÓN DEL PROYECTO
import initDb from "./src/config/database.js"; // Función para inicializar conexión a MongoDB
import router from "./src/routes/index.js"; // Router principal que agrupa todas las rutas

//! IMPORT DE TAREAS PROGRAMADAS (CRON JOBS)
// Este import ejecuta automáticamente el archivo, iniciando el cron job
// que rechaza reportes antiguos cada día a medianoche
import "./src/jobs/auto_reject_reports.js";

//* CONFIGURACIÓN DE __dirname PARA MÓDULOS ES6
// En ES6 modules, __dirname no existe por defecto, lo creamos manualmente
const __filename = fileURLToPath(import.meta.url); // Obtiene la ruta completa del archivo actual
const __dirname = path.dirname(__filename); // Obtiene el directorio del archivo actual

//* INICIALIZACIÓN DE LA APLICACIÓN EXPRESS
const app = express();
const PORT = process.env.PORT; // Puerto del servidor desde variables de entorno

//* ============================================
//* MIDDLEWARES GLOBALES
//* ============================================

//? Middleware para parsear JSON
// Permite que Express entienda el body de las peticiones en formato JSON
app.use(express.json());

//? Middleware de CORS
// Permite que el frontend (en otro dominio/puerto) pueda hacer peticiones a este backend
app.use(cors());

//? Middleware para servir archivos estáticos
// Hace que la carpeta 'uploads' sea accesible públicamente
// Ejemplo: http://localhost:3000/uploads/profiles/profile-123456.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//* ============================================
//* CONFIGURACIÓN DE RUTAS
//* ============================================

//? Todas las rutas de la API empiezan con /api
// Ejemplo: /api/auth/login, /api/reports, etc.
app.use("/api", router);

//* ============================================
//* INICIALIZACIÓN DEL SERVIDOR
//* ============================================

//! Primero conecta a la base de datos, luego inicia el servidor
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en ${PORT}`);
  });
});

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// PORT = Puerto donde corre el servidor
// __filename = Nombre del archivo actual con ruta completa
// __dirname = Directorio donde está ubicado este archivo
// app = Instancia de la aplicación Express

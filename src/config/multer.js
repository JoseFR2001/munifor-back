//* ============================================
//* CONFIGURACIÓN DE MULTER - SUBIDA DE IMÁGENES
//* ============================================

//! IMPORTS DE DEPENDENCIAS
import multer from "multer"; // Middleware para manejar multipart/form-data (archivos)
import path from "path"; // Utilidad para trabajar con rutas de archivos
import { fileURLToPath } from "url"; // Convierte URL de módulo ES6 a ruta de archivo

//* CONFIGURACIÓN DE __dirname PARA MÓDULOS ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//* ============================================
//* CONFIGURACIÓN DE ALMACENAMIENTO - FOTOS DE PERFIL
//* ============================================

/**
 * Almacenamiento para imágenes de perfil de usuarios
 * Guarda en: uploads/profiles/
 * Formato de nombre: profile-[timestamp]-[random].ext
 */
const profileStorage = multer.diskStorage({
  //? Destino donde se guardarán las imágenes
  destination: function (req, file, cb) {
    // Navega desde src/config/ hasta uploads/profiles/
    cb(null, path.join(__dirname, "../../uploads/profiles"));
  },

  //? Nombre único para cada archivo subido
  filename: function (req, file, cb) {
    // Genera un sufijo único combinando timestamp + número aleatorio
    // Esto evita conflictos si dos usuarios suben archivos al mismo tiempo
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    // Formato: profile-1699564823456-987654321.jpg
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

//* ============================================
//* CONFIGURACIÓN DE ALMACENAMIENTO - REPORTES
//* ============================================

/**
 * Almacenamiento para imágenes de reportes ciudadanos
 * Guarda en: uploads/reports/
 * Formato de nombre: report-[timestamp]-[random].ext
 */
const reportStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/reports"));
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "report-" + uniqueSuffix + path.extname(file.originalname));
  },
});

//* ============================================
//* CONFIGURACIÓN DE ALMACENAMIENTO - AVANCES
//* ============================================

/**
 * Almacenamiento para imágenes de avances (progress reports)
 * Guarda en: uploads/progress/
 * Formato de nombre: progress-[timestamp]-[random].ext
 */
const progressStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/progress"));
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "progress-" + uniqueSuffix + path.extname(file.originalname));
  },
});

//* ============================================
//* FILTRO DE VALIDACIÓN DE IMÁGENES
//* ============================================

/**
 * Valida que el archivo sea una imagen permitida
 * Formatos permitidos: jpeg, jpg, png, gif, webp
 * @param {Object} req - Objeto de petición HTTP
 * @param {Object} file - Archivo subido
 * @param {Function} cb - Callback de Multer
 */
const imageFilter = (req, file, cb) => {
  //? Expresión regular con los tipos de imagen permitidos
  const allowedTypes = /jpeg|jpg|png|gif|webp/;

  //? Valida la extensión del archivo (ej: .jpg, .png)
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  //? Valida el MIME type (ej: image/jpeg, image/png)
  // Esto es más seguro que solo validar la extensión
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    //! Si pasa ambas validaciones, acepta el archivo
    return cb(null, true);
  } else {
    //! Si no es una imagen válida, rechaza con error
    cb(
      new Error(
        "Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)"
      )
    );
  }
};

//* ============================================
//* MIDDLEWARES DE MULTER EXPORTADOS
//* ============================================

/**
 * Middleware para subir UNA foto de perfil
 * Campo esperado en el formulario: "profile_picture"
 * Límite de tamaño: 15MB
 */
export const uploadProfilePicture = multer({
  storage: profileStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB máximo
  fileFilter: imageFilter,
}).single("profile_picture"); // .single() = espera UN solo archivo

/**
 * Middleware para subir MÚLTIPLES imágenes de reportes
 * Campo esperado en el formulario: "images"
 * Máximo: 5 imágenes
 * Límite de tamaño: 15MB por archivo
 */
export const uploadReportImages = multer({
  storage: reportStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB por archivo
  fileFilter: imageFilter,
}).array("images", 5); // .array() = espera MÚLTIPLES archivos (máximo 5)

/**
 * Middleware para subir MÚLTIPLES imágenes de avances
 * Campo esperado en el formulario: "images"
 * Máximo: 5 imágenes
 * Límite de tamaño: 15MB por archivo
 */
export const uploadProgressImages = multer({
  storage: progressStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB por archivo
  fileFilter: imageFilter,
}).array("images", 5); // .array() = espera MÚLTIPLES archivos (máximo 5)

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// multer = Biblioteca para manejar subida de archivos
// diskStorage = Almacenamiento en disco (guarda archivos en el servidor)
// destination = Destino/carpeta donde se guardan los archivos
// filename = Nombre del archivo que se guardará
// uniqueSuffix = Sufijo único (combinación de timestamp + número aleatorio)
// fileFilter = Filtro para validar tipos de archivos
// allowedTypes = Tipos permitidos (formatos de imagen)
// extname = Extensión del nombre del archivo (.jpg, .png, etc.)
// mimetype = Tipo MIME del archivo (image/jpeg, image/png, etc.)
// cb = Callback (función que se ejecuta después)
// fileSize = Tamaño del archivo en bytes
// 1024 * 1024 = 1 Megabyte (1MB)
// 5 * 1024 * 1024 = 5 Megabytes (5MB)
// .single() = Acepta un solo archivo
// .array() = Acepta múltiples archivos (array)

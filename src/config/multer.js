import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento para fotos de perfil
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/profiles"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "profile-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configuración de almacenamiento para reportes
const reportStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/reports"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "report-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configuración de almacenamiento para progress reports
const progressStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../uploads/progress"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "progress-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Filtro para validar que solo sean imágenes
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(
      new Error(
        "Solo se permiten archivos de imagen (jpg, jpeg, png, gif, webp)"
      )
    );
  }
};

// Middleware de multer para cada tipo
export const uploadProfilePicture = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: imageFilter,
}).single("profile_picture"); // Campo: profile_picture

export const uploadReportImages = multer({
  storage: reportStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max por archivo
  fileFilter: imageFilter,
}).array("images", 5); // Campo: images, máximo 5 archivos

export const uploadProgressImages = multer({
  storage: progressStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max por archivo
  fileFilter: imageFilter,
}).array("images", 5); // Campo: images, máximo 5 archivos

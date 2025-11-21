//* ============================================
//* MODELO DE AVANCE/PROGRESS REPORT - SCHEMA DE MONGOOSE
//* ============================================

import { model, Schema, Types } from "mongoose";

//* ============================================
//* DEFINICIÓN DEL SCHEMA DE AVANCE
//* ============================================

const ProgressReportSchema = new Schema(
  {
    //! INFORMACIÓN BÁSICA DEL AVANCE

    //? Título descriptivo del avance
    // Ejemplo: "Reparación de baches completada al 50%"
    title: { type: String, required: true },

    //? Descripción detallada del progreso realizado
    // Qué se hizo, qué materiales se usaron, etc.
    description: { type: String, required: true },

    //! RELACIONES

    //? Trabajador que creó este avance (líder de la cuadrilla)
    // Referencia a User con role "Trabajador"
    worker: { type: Types.ObjectId, ref: "User", required: true },

    //? Cuadrilla que realizó el trabajo
    // Referencia a Crew
    crew: { type: Types.ObjectId, ref: "Crew", required: true },

    //? Tarea asociada a este avance
    // Cada avance pertenece a una tarea específica
    task: { type: Types.ObjectId, ref: "Task", required: true },

    //! ESTADO DEL AVANCE

    //? Estado del progreso
    // Pendiente: Aún no se empezó
    // En Progreso: Trabajando actualmente
    // Finalizado: Trabajo completado ⚠️ IMPORTANTE: Activa auto-completado en cascada
    status: {
      type: String,
      enum: ["Pendiente", "En Progreso", "Finalizado"],
      default: "Pendiente",
    },

    //! IMÁGENES DEL AVANCE (MULTER)

    //? Array de rutas de imágenes subidas con Multer
    // Fotos del trabajo realizado (antes/después)
    // Máximo 5 imágenes por avance
    // Ejemplo: ["uploads/progress/progress-123.jpg", "uploads/progress/progress-124.jpg"]
    images: {
      type: [String], // Array de strings
      default: [], // Array vacío si no hay imágenes
    },

    //! SOFT DELETE

    //? Fecha de eliminación (soft delete)
    deleted_at: { type: Date, default: null },

    //! UBICACIÓN GEOGRÁFICA

    //? Coordenadas GPS donde se realizó el trabajo
    // Opcional porque puede heredarse de la tarea
    location: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
    },
  },
  {
    //! OPCIONES DEL SCHEMA

    //? Timestamps automáticos con nombres personalizados
    timestamps: {
      createdAt: "created_at", // Fecha de creación del avance
      updatedAt: "updated_at", // Fecha de última actualización
    },

    //? Elimina el campo __v (version key) de Mongoose
    versionKey: false,
  }
);

//* ============================================
//* CREACIÓN Y EXPORTACIÓN DEL MODELO
//* ============================================

const ProgressReportModel = model("ProgressReport", ProgressReportSchema);
export default ProgressReportModel;

//* ============================================
//* ⚠️ LÓGICA ESPECIAL - AUTO-COMPLETADO EN CASCADA
//* ============================================
// Cuando se crea un ProgressReport con status="Finalizado":
// 1. Actualiza la Task asociada a status="Finalizada"
// 2. Actualiza TODOS los Reports asociados a esa Task a status="Completado"
// Esta lógica está implementada en progress_report.controller.js
// en la función createProgressReport

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// ProgressReportSchema = Esquema de Avance/Reporte de Progreso
// ProgressReport = Avance/Reporte de Progreso
// title = Título
// description = Descripción
// worker = Trabajador
// crew = Cuadrilla
// task = Tarea
// status = Estado
// images = Imágenes
// deleted_at = Eliminado en (fecha)
// location = Ubicación
// lat = Latitud
// lng = Longitud
// created_at = Creado en (fecha)
// updated_at = Actualizado en (fecha)

//* ============================================
//* MODELO DE REPORTE - SCHEMA DE MONGOOSE
//* ============================================

import { model, Schema, Types } from "mongoose";

//* ============================================
//* DEFINICIÓN DEL SCHEMA DE REPORTE
//* ============================================

const ReportSchema = new Schema(
  {
    //! INFORMACIÓN BÁSICA DEL REPORTE

    //? Título descriptivo del reporte
    title: { type: String, required: true },

    //? Descripción detallada del problema
    description: { type: String, required: true },

    //! ESTADO DEL REPORTE (FLUJO DE TRABAJO)

    //? Estado actual del reporte
    // Pendiente: Recién creado, esperando revisión
    // Revisado: Un operador lo revisó
    // Aceptado: El operador aprobó el reporte y puede crear tarea
    // Completado: La tarea asociada fue finalizada (auto-actualizado)
    // Rechazado: El operador lo rechazó (no procede) o pasaron 30 días sin revisión
    status: {
      type: String,
      enum: ["Pendiente", "Revisado", "Aceptado", "Completado", "Rechazado"],
      default: "Pendiente",
    },

    //! RELACIONES CON USUARIOS

    //? Autor del reporte (ciudadano que lo creó)
    // Referencia a User con role "Ciudadano"
    author: { type: Types.ObjectId, ref: "User" },

    //? Operador asignado para revisar este reporte
    // Referencia a User con role "Operador"
    assigned_operator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null, // Null hasta que un operador lo tome
    },

    //! UBICACIÓN GEOGRÁFICA

    //? Coordenadas GPS del problema reportado
    location: {
      lat: { type: Number, required: true }, // Latitud
      lng: { type: Number, required: true }, // Longitud
    },

    //! CATEGORIZACIÓN

    //? Tipo de problema reportado
    report_type: {
      type: String,
      enum: ["Bache", "Alumbrado", "Basura", "Otro"],
      default: "",
    },

    //? Detalle adicional si el tipo es "Otro"
    // Solo se usa cuando report_type === "Otro"
    other_type_detail: {
      type: String,
      default: null,
    },

    //! IMÁGENES DEL REPORTE (MULTER)

    //? Array de rutas de imágenes subidas con Multer
    // Máximo 5 imágenes por reporte
    // Ejemplo: ["uploads/reports/report-123.jpg", "uploads/reports/report-124.jpg"]
    images: {
      type: [String], // Array de strings
      default: [], // Array vacío si no hay imágenes
    },

    //! CONTROL DE TAREAS

    //? Indica si ya se creó una tarea para este reporte
    // true: Ya tiene tarea asignada
    // false: Aún no se creó una tarea
    task_assigned: { type: Boolean, default: false },

    //! FECHAS IMPORTANTES

    //? Fecha en que el reporte fue aprobado
    approved_at: { type: Date, default: null },

    //? Fecha en que el reporte fue completado
    // Se actualiza automáticamente cuando la tarea asociada se finaliza
    completed_at: { type: Date, default: null },

    //! SOFT DELETE

    //? Fecha de eliminación (soft delete)
    // Si tiene valor, el reporte está "eliminado" pero no se borra de la BD
    deleted_at: { type: Date, default: null },
  },
  {
    //! OPCIONES DEL SCHEMA

    //? Incluye propiedades virtuales al convertir a JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    //? Timestamps automáticos con nombres personalizados
    timestamps: {
      createdAt: "created_at", // Fecha de creación del reporte
      updatedAt: "updated_at", // Fecha de última actualización
    },

    //? Elimina el campo __v (version key) de Mongoose
    versionKey: false,
  }
);

//* ============================================
//* PROPIEDADES VIRTUALES (RELACIONES)
//* ============================================

//? Virtual: Tareas asociadas a este reporte
// Un reporte puede estar incluido en una o más tareas
// Relación: Report -> Task (uno a muchos)
ReportSchema.virtual("tasks", {
  ref: "Task", // Modelo relacionado
  localField: "_id", // Campo local (Report._id)
  foreignField: "report", // Campo en Task (Task.report es un array)
});

//* ============================================
//* CREACIÓN Y EXPORTACIÓN DEL MODELO
//* ============================================

const ReportModel = model("Report", ReportSchema);
export default ReportModel;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// ReportSchema = Esquema de Reporte
// title = Título
// description = Descripción
// status = Estado
// author = Autor
// assigned_operator = Operador asignado
// location = Ubicación
// lat = Latitud
// lng = Longitud
// report_type = Tipo de reporte
// other_type_detail = Detalle de otro tipo
// images = Imágenes
// task_assigned = Tarea asignada (booleano)
// approved_at = Aprobado en (fecha)
// completed_at = Completado en (fecha)
// deleted_at = Eliminado en (fecha)
// created_at = Creado en (fecha)
// updated_at = Actualizado en (fecha)
// tasks = Tareas (virtual)

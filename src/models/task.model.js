//* ============================================
//* MODELO DE TAREA - SCHEMA DE MONGOOSE
//* ============================================

import { model, Schema, Types } from "mongoose";

//* ============================================
//* DEFINICIÓN DEL SCHEMA DE TAREA
//* ============================================

const TaskSchema = new Schema(
  {
    //! INFORMACIÓN BÁSICA DE LA TAREA

    //? Título descriptivo de la tarea
    title: { type: String, required: true },

    //! RELACIONES

    //? Cuadrilla asignada para realizar esta tarea
    // Referencia a Crew (equipo de trabajadores)
    crew: { type: Types.ObjectId, ref: "Crew" },

    //? Array de reportes asociados a esta tarea
    // Una tarea puede agrupar múltiples reportes del mismo tipo/zona
    // Ejemplo: 5 reportes de baches en la misma calle
    report: [{ type: Types.ObjectId, ref: "Report", required: true }],

    //! CLASIFICACIÓN Y ESTADO

    //? Nivel de prioridad de la tarea
    priority: {
      type: String,
      enum: ["Baja", "Media", "Alta"],
      default: "Media",
    },

    //? Estado actual de la tarea
    // Pendiente: Recién creada, esperando que el crew comience
    // En Progreso: El crew está trabajando en ella
    // Finalizada: El crew completó la tarea (auto-actualizado cuando progress status = "Finalizado")
    status: {
      type: String,
      enum: ["Pendiente", "En Progreso", "Finalizada"],
      default: "Pendiente",
    },

    //! SOFT DELETE

    //? Fecha de eliminación (soft delete)
    deleted_at: { type: Date, default: null },

    //! TIPO DE TAREA

    //? Categoría de trabajo a realizar
    // Reparación: Arreglar algo roto (baches, alumbrado)
    // Mantenimiento: Trabajo preventivo
    // Recolección: Recoger basura u objetos
    // Supervisión: Inspeccionar o verificar
    task_type: {
      type: String,
      enum: ["Reparación", "Mantenimiento", "Recolección", "Supervisión"],
      required: true,
    },

    //! CONTROL Y ASIGNACIÓN

    //? Operador que creó esta tarea
    // Referencia a User con role "Operador"
    assigned_operator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    //! UBICACIÓN GEOGRÁFICA

    //? Coordenadas GPS donde se realizará la tarea
    // Opcional porque puede heredarse de los reportes asociados
    location: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
    },
  },
  {
    //! OPCIONES DEL SCHEMA

    //? Incluye propiedades virtuales al convertir a JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    //? Timestamps automáticos con nombres personalizados
    timestamps: {
      createdAt: "created_at", // Fecha de creación de la tarea
      updatedAt: "updated_at", // Fecha de última actualización
    },

    //? Elimina el campo __v (version key) de Mongoose
    versionKey: false,
  }
);

//* ============================================
//* PROPIEDADES VIRTUALES (RELACIONES)
//* ============================================

//? Virtual: Avances/reportes de progreso de esta tarea
// El crew va creando progress reports mientras trabaja
// Relación: Task -> ProgressReport (uno a muchos)
TaskSchema.virtual("progress_reports", {
  ref: "ProgressReport", // Modelo relacionado
  localField: "_id", // Campo local (Task._id)
  foreignField: "task", // Campo en ProgressReport (ProgressReport.task)
});

//* ============================================
//* CREACIÓN Y EXPORTACIÓN DEL MODELO
//* ============================================

const TaskModel = model("Task", TaskSchema);
export default TaskModel;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// TaskSchema = Esquema de Tarea
// title = Título
// crew = Cuadrilla/Equipo
// report = Reporte(s) asociado(s)
// priority = Prioridad
// status = Estado
// deleted_at = Eliminado en (fecha)
// task_type = Tipo de tarea
// assigned_operator = Operador asignado/que creó la tarea
// location = Ubicación
// lat = Latitud
// lng = Longitud
// created_at = Creado en (fecha)
// updated_at = Actualizado en (fecha)
// progress_reports = Reportes de progreso/avances (virtual)

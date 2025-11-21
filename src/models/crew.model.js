//* ============================================
//* MODELO DE CUADRILLA/CREW - SCHEMA DE MONGOOSE
//* ============================================

import { model, Schema, Types } from "mongoose";

//* ============================================
//* DEFINICIÓN DEL SCHEMA DE CUADRILLA
//* ============================================

const CrewSchema = new Schema(
  {
    //! INFORMACIÓN BÁSICA DE LA CUADRILLA

    //? Nombre identificativo de la cuadrilla
    // Ejemplo: "Cuadrilla Centro", "Equipo de Alumbrado", etc.
    name: { type: String, required: true },

    //! ESTRUCTURA DE LA CUADRILLA

    //? Líder de la cuadrilla
    // Usuario con role "Trabajador" que coordina al equipo
    // Es quien crea los progress reports
    leader: { type: Types.ObjectId, ref: "User" },

    //? Miembros de la cuadrilla (array)
    // Array de usuarios con role "Trabajador"
    // Pueden ser varios trabajadores bajo un mismo líder
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],

    //! SOFT DELETE

    //? Fecha de eliminación (soft delete)
    // Si tiene valor, la cuadrilla está "eliminada" pero no se borra de la BD
    deleted_at: { type: Date, default: null },
  },
  {
    //! OPCIONES DEL SCHEMA

    //? Incluye propiedades virtuales al convertir a JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    //? Timestamps automáticos con nombres personalizados
    timestamps: {
      createdAt: "created_at", // Fecha de creación de la cuadrilla
      updatedAt: "updated_at", // Fecha de última actualización
    },

    //? Elimina el campo __v (version key) de Mongoose
    versionKey: false,
  }
);

//* ============================================
//* PROPIEDADES VIRTUALES (RELACIONES)
//* ============================================

//? Virtual: Tareas asignadas a esta cuadrilla
// Todas las tareas que este equipo debe realizar
// Relación: Crew -> Task (uno a muchos)
CrewSchema.virtual("tasks", {
  ref: "Task", // Modelo relacionado
  localField: "_id", // Campo local (Crew._id)
  foreignField: "crew", // Campo en Task (Task.crew)
});

//* ============================================
//* CREACIÓN Y EXPORTACIÓN DEL MODELO
//* ============================================

const CrewModel = model("Crew", CrewSchema);
export default CrewModel;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// CrewSchema = Esquema de Cuadrilla/Equipo
// Crew = Cuadrilla/Equipo de trabajo
// name = Nombre
// leader = Líder/Jefe de cuadrilla
// members = Miembros del equipo
// deleted_at = Eliminado en (fecha)
// created_at = Creado en (fecha)
// updated_at = Actualizado en (fecha)
// tasks = Tareas asignadas (virtual)

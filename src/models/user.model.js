//* ============================================
//* MODELO DE USUARIO - SCHEMA DE MONGOOSE
//* ============================================

import { model, Schema } from "mongoose";

//* ============================================
//* DEFINICIÓN DEL SCHEMA DE USUARIO
//* ============================================

const UserSchema = new Schema(
  {
    //! DATOS DE AUTENTICACIÓN

    //? Nombre de usuario único para login
    username: {
      type: String,
      required: true, // Obligatorio
      unique: true, // No puede haber dos usuarios con el mismo username
    },

    //? Email único para login y comunicaciones
    email: {
      type: String,
      required: true,
      unique: true, // No puede haber dos usuarios con el mismo email
    },

    //? Contraseña hasheada con bcrypt
    password: {
      type: String,
      required: true,
      select: false, // NO se incluye en las consultas por defecto (seguridad)
    },

    //! SISTEMA DE ROLES

    //? Rol del usuario en el sistema
    // Ciudadano: Puede crear reportes
    // Operador: Puede revisar/aceptar reportes y crear tareas
    // Trabajador: Puede ser asignado a crews y crear avances
    // Administrador: Acceso total al sistema
    role: {
      type: String,
      enum: ["Ciudadano", "Operador", "Trabajador", "Administrador"],
      default: "Ciudadano", // Por defecto, todo usuario nuevo es Ciudadano
    },

    //! ESTADOS DEL USUARIO

    //? Estado de activación por administrador
    // Los usuarios nuevos están inactivos hasta que un admin los active
    is_active: {
      type: Boolean,
      default: false,
    },

    //? Disponibilidad para ser asignado a un crew
    // Si un trabajador ya está en un crew, se marca como no disponible
    is_available: {
      type: Boolean,
      default: true,
    },

    //! INFORMACIÓN DE PERFIL

    //? Objeto anidado con datos personales del usuario
    profile: {
      first_name: {
        type: String,
        required: true,
      },
      last_name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      age: {
        type: Number,
      },
      address: {
        type: String,
      },
      sex: {
        type: String,
        enum: ["Hombre", "Mujer", "Otro"],
        default: "Otro",
      },
    },

    //! IMAGEN DE PERFIL (MULTER)

    //? Ruta de la foto de perfil subida con Multer
    // Ejemplo: "uploads/profiles/profile-1699564823456.jpg"
    profile_picture: {
      type: String,
      default: null, // Null si no tiene foto de perfil
    },

    //! SOFT DELETE

    //? Fecha de eliminación (soft delete)
    // Si tiene valor, el usuario está "eliminado" pero no se borra de la BD
    deleted_at: {
      type: Date,
      default: null,
    },

    //! RECUPERACIÓN DE CONTRASEÑA

    //? Token único generado para recuperar contraseña
    // Se genera cuando el usuario solicita recuperar su contraseña
    password_reset_token: {
      type: String,
      default: null,
    },

    //? Fecha de expiración del token de recuperación
    // El token solo es válido por un tiempo limitado (ej: 1 hora)
    password_reset_expires: {
      type: Date,
      default: null,
    },
  },
  {
    //! OPCIONES DEL SCHEMA

    //? Incluye propiedades virtuales al convertir a JSON/Object
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

    //? Timestamps automáticos con nombres personalizados
    timestamps: {
      createdAt: "created_at", // Fecha de creación
      updatedAt: "updated_at", // Fecha de última actualización
    },

    //? Elimina el campo __v (version key) de Mongoose
    versionKey: false,
  }
);

//* ============================================
//* PROPIEDADES VIRTUALES (RELACIONES)
//* ============================================

//? Virtual: Reportes creados por este usuario (ciudadano)
// Relación: User -> Report (uno a muchos)
UserSchema.virtual("reports", {
  ref: "Report", // Modelo relacionado
  localField: "_id", // Campo local (User._id)
  foreignField: "author", // Campo en Report (Report.author)
});

//? Virtual: Reportes asignados a este usuario (operador)
// Relación: User -> Report (uno a muchos)
UserSchema.virtual("assigned_reports", {
  ref: "Report",
  localField: "_id",
  foreignField: "assigned_operator", // Reportes donde este operador fue asignado
});

//? Virtual: Avances creados por este usuario (trabajador)
// Relación: User -> ProgressReport (uno a muchos)
UserSchema.virtual("progress_reports", {
  ref: "ProgressReport",
  localField: "_id",
  foreignField: "worker", // Avances creados por este trabajador
});

//? Virtual: Crews liderados por este usuario (líder de cuadrilla)
// Relación: User -> Crew (uno a muchos)
UserSchema.virtual("crews_led", {
  ref: "Crew",
  localField: "_id",
  foreignField: "leader", // Crews donde este usuario es el líder
});

//? Virtual: Crews donde este usuario es miembro
// Relación: User -> Crew (muchos a muchos)
UserSchema.virtual("crews_member", {
  ref: "Crew",
  localField: "_id",
  foreignField: "members", // Crews donde este usuario está en el array de miembros
});

//? Virtual: Tareas asignadas a este usuario (operador)
// Relación: User -> Task (uno a muchos)
UserSchema.virtual("assigned_tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "assigned_operator", // Tareas creadas por este operador
});

//* ============================================
//* CREACIÓN Y EXPORTACIÓN DEL MODELO
//* ============================================

const UserModel = model("User", UserSchema);
export default UserModel;

//* ============================================
//* TRADUCCIÓN DE CONSTANTES
//* ============================================
// UserSchema = Esquema de Usuario
// username = Nombre de usuario
// email = Correo electrónico
// password = Contraseña
// role = Rol/Papel en el sistema
// is_active = Está activo
// is_available = Está disponible
// profile = Perfil
// first_name = Primer nombre
// last_name = Apellido
// phone = Teléfono
// age = Edad
// address = Dirección
// sex = Sexo/Género
// profile_picture = Foto de perfil
// deleted_at = Eliminado en (fecha)
// password_reset_token = Token de recuperación de contraseña
// password_reset_expires = Expiración del token de recuperación
// created_at = Creado en (fecha)
// updated_at = Actualizado en (fecha)
// virtuals = Propiedades virtuales (no se guardan en BD, se calculan)
// ref = Referencia (modelo relacionado)
// localField = Campo local
// foreignField = Campo foráneo
// reports = Reportes
// assigned_reports = Reportes asignados
// progress_reports = Avances/Reportes de progreso
// crews_led = Cuadrillas lideradas
// crews_member = Cuadrillas donde es miembro
// assigned_tasks = Tareas asignadas

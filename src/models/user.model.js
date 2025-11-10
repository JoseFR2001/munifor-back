import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["Ciudadano", "Operador", "Trabajador", "Administrador"],
      default: "Ciudadano",
    },
    // Estado de activación por admin
    is_active: {
      type: Boolean,
      default: false,
    },
    // Disponible para ser asignado a un crew
    is_available: {
      type: Boolean,
      default: true,
    },
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

    deleted_at: {
      type: Date,
      default: null,
    },
    // Token para recuperación de contraseña
    password_reset_token: {
      type: String,
      default: null,
    },
    // Fecha de expiración del token de recuperación
    password_reset_expires: {
      type: Date,
      default: null,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  }
);

UserSchema.virtual("reports", {
  ref: "Report",
  localField: "_id",
  foreignField: "author",
});

UserSchema.virtual("assigned_reports", {
  ref: "Report",
  localField: "_id",
  foreignField: "assigned_operator",
});

UserSchema.virtual("progress_reports", {
  ref: "ProgressReport",
  localField: "_id",
  foreignField: "worker",
});

UserSchema.virtual("crews_led", {
  ref: "Crew",
  localField: "_id",
  foreignField: "leader",
});

UserSchema.virtual("crews_member", {
  ref: "Crew",
  localField: "_id",
  foreignField: "members",
});

UserSchema.virtual("assigned_tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "assigned_operator",
});

const UserModel = model("User", UserSchema);
export default UserModel;

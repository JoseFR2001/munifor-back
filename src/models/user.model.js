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
    },
    role: {
      type: String,
      enum: ["Ciudadano", "Operador", "Trabajador", "Administrador"],
      default: "Ciudadano",
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
const UserModel = model("User", UserSchema);
export default UserModel;

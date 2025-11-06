import { model, Schema, Types } from "mongoose";

const ReportSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pendiente", "Revisado", "Aceptado", "Completado", "Rechazado"],
      default: "Pendiente",
    },
    author: { type: Types.ObjectId, ref: "User" },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    report_type: {
      type: String,
      enum: ["Bache", "Alumbrado", "Basura", "Otro"],
      default: "",
    },
    other_type_detail: {
      type: String,
      default: null,
    },
    approved_at: { type: Date, default: null },
    completed_at: { type: Date, default: null },
    deleted_at: { type: Date, default: null },
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

ReportSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "report",
});

const ReportModel = model("Report", ReportSchema);
export default ReportModel;

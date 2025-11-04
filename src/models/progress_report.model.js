import { model, Schema, Types } from "mongoose";

const ProgressReportSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    worker: { type: Types.ObjectId, ref: "User", required: true },
    crew: { type: Types.ObjectId, ref: "Crew", required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["Pendiente", "En Progreso", "Finalizado"],
      default: "Pendiente",
    },
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  }
);

const ProgressReportModel = model("ProgressReport", ProgressReportSchema);
export default ProgressReportModel;

import { model, Schema, Types } from "mongoose";

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    crew: { type: Types.ObjectId, ref: "Crew" },
    report: { type: Types.ObjectId, ref: "Report", required: true },
    priority: {
      type: String,
      enum: ["Baja", "Media", "Alta"],
      default: "Media",
    },
    status: {
      type: String,
      enum: ["Pendiente", "En Progreso", "Finalizada"],
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

const TaskModel = model("Task", TaskSchema);
export default TaskModel;

import { model, Schema, Types } from "mongoose";

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    crew: { type: Types.ObjectId, ref: "Crew" },
    report: [{ type: Types.ObjectId, ref: "Report", required: true }],
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
    task_type: {
      type: String,
      enum: ["Reparación", "Mantenimiento", "Recolección", "Supervisión"],
      required: true,
    },
    assigned_operator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    location: {
      lat: { type: Number, required: false },
      lng: { type: Number, required: false },
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

TaskSchema.virtual("progress_reports", {
  ref: "ProgressReport",
  localField: "_id",
  foreignField: "task",
});

const TaskModel = model("Task", TaskSchema);
export default TaskModel;

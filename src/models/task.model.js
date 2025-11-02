import { model, Schema, Types } from "mongoose";

const TaskSchema = new Schema(
  {
    title: { type: String, required: true },
    crew: { type: Types.ObjectId, ref: "Crew", required: true },
    report: { type: Types.ObjectId, ref: "Report", required: true },
    priority: {
      type: String,
      enum: ["Baja", "Media", "Alta"],
      default: "Media",
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

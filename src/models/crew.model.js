import { model, Schema, Types } from "mongoose";

const CrewSchema = new Schema(
  {
    name: { type: String, required: true },
    leader: { type: Types.ObjectId, ref: "User" },
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
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

CrewSchema.virtual("tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "crew",
});

const CrewModel = model("Crew", CrewSchema);
export default CrewModel;

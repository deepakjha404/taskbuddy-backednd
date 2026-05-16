import { model, Schema } from "mongoose";
import { IProjectDoc, IProjectModel } from "../schemas";
import { Status } from "../enums";

const projectSchema = new Schema<IProjectDoc>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  },
);

export const Project = model<IProjectDoc, IProjectModel>(
  "Project",
  projectSchema,
  "project",
);

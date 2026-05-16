import { model, Schema } from "mongoose";
import { IUSerDoc, IUserModel } from "../schemas";
import { Role, Status } from "../enums";

const userSchema = new Schema<IUSerDoc>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    emailId: {
      type: String,
      trim: true,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(Role),
      default: Role.MEMBER,
    },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.ACTIVE,
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    attempt: {
      type: Number,
      default: 0,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  },
);

export const User = model<IUSerDoc, IUserModel>("User", userSchema, "user");

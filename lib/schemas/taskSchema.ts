import { Document, Model } from "mongoose";
import { TypesObjectId } from ".";

export interface ITask {
  title: string;
  description: string;
  dueDate: Date;
  priority: string;
  status: string;
  assignedTo: TypesObjectId;
  project: TypesObjectId;
  createdBy: TypesObjectId;
}

export interface ITaskDoc extends ITask, Document {
  _id: TypesObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ITaskModel = Model<ITaskDoc>;

import { Document, Model } from "mongoose";
import { TypesObjectId } from ".";

export interface IProject {
  name: string;
  description?: string;
  admin: TypesObjectId;
  members: TypesObjectId[];
  status: string;
}

export interface IProjectDoc extends IProject, Document {
  _id: TypesObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IProjectModel = Model<IProjectDoc>;

import { Model } from "mongoose";
import { TypesObjectId } from ".";

export interface IUser {
  id: TypesObjectId;
  name: string;
  emailId: string;
  role: string;
  status: string;
  attempt: number;
  isLocked?: boolean;
  password: string;
  lockUntil?: Date;
}

export interface IUSerDoc extends IUser, Document {
  _id: TypesObjectId;
  createdAt: Date;
  updatedAt: Date;
}
export type IUserModel = Model<IUSerDoc>;

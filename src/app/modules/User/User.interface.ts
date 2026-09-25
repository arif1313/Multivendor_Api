import { Document, Types } from "mongoose";

export type TUserRole = "admin" | "vendor" | "customer";

export type IUser = {
  name: string;
  email: string;
  contactNumber?: string;
  password: string;
  role: TUserRole;
  address?: string;
  profileImage?: string;
  isBlocked: boolean;
  isDeleted: boolean;
};

export interface IUserDocument extends IUser, Document {
  _id: Types.ObjectId;
  comparePassword(plain: string): Promise<boolean>;
}

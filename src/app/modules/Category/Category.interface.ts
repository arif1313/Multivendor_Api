import { Document, Types } from "mongoose";

export type ICategory = {
  name: string;
  slug: string;
  image?: string;
  isDeleted: boolean;
};

export interface ICategoryDocument extends ICategory, Document {
  _id: Types.ObjectId;
}

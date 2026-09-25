import { Schema, model } from "mongoose";
import { ICategoryDocument } from "./Category.interface";

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const CategoryModel = model<ICategoryDocument>("Category", CategorySchema);

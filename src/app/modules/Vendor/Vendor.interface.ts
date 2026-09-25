import { Document, Types } from "mongoose";

export type IVendor = {
  userId: Types.ObjectId;
  shopName: string;
  brandName?: string;
  slug: string;
  logo?: string;
  banner?: string;
  description?: string;
  address?: string;
  contactNumber?: string;
  avgRating: number;
  ratingCount: number;
  isBlocked: boolean;
  isDeleted: boolean;
};

export interface IVendorDocument extends IVendor, Document {
  _id: Types.ObjectId;
}

import { Document, Types } from "mongoose";

export type TPaymentOption = "cod" | "bkash" | "both";

export type IProduct = {
  vendorId: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  categoryId?: Types.ObjectId;
  brand?: string;
  images: string[];
  /** Payment methods the vendor accepts for this product. */
  paymentOptions: TPaymentOption;
  deliveryCharge: number;
  avgRating: number;
  ratingCount: number;
  isActive: boolean;
  isBlocked: boolean;
  isDeleted: boolean;
};

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
}

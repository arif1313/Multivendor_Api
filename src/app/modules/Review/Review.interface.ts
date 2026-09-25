import { Document, Types } from "mongoose";

export type IReview = {
  customerId?: Types.ObjectId;
  guestId?: string;
  reviewerName: string;
  productId?: Types.ObjectId;
  vendorId: Types.ObjectId;
  rating: number;
  comment?: string;
  isDeleted: boolean;
};

export interface IReviewDocument extends IReview, Document {
  _id: Types.ObjectId;
}

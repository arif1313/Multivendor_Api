import { Document, Types } from "mongoose";

export type ICartItem = {
  productId: Types.ObjectId;
  vendorId: Types.ObjectId;
  quantity: number;
};

export type ICart = {
  /** Exactly one of customerId / guestId is set. */
  customerId?: Types.ObjectId;
  guestId?: string;
  items: ICartItem[];
};

export interface ICartDocument extends ICart, Document {
  _id: Types.ObjectId;
}

import { Document, Types } from "mongoose";

export type TOrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
/** bkash_full / bkash_delivery_only are schema-ready for the future gateway. */
export type TPaymentMethod = "cod" | "bkash_full" | "bkash_delivery_only";
export type TPaymentStatus = "unpaid" | "partially_paid" | "paid" | "failed";
export type TPaymentMode = "full" | "delivery_charge_only";

export type IOrderItem = {
  productId: Types.ObjectId;
  name: string;
  image?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

export type ICustomerInfo = {
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  note?: string;
};

export type IOrder = {
  orderNumber: string;
  customerId?: Types.ObjectId;
  guestId?: string;
  vendorId: Types.ObjectId;
  /** Set when a multi-vendor cart was split into one order per shop. */
  parentOrderId?: string;
  items: IOrderItem[];
  customerInfo: ICustomerInfo;
  productTotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: TPaymentMethod;
  paymentStatus: TPaymentStatus;
  paymentMode?: TPaymentMode;
  paidAmount: number;
  dueAmount: number;
  transactionId?: string;
  orderStatus: TOrderStatus;
  cancelReason?: string;
  isDeleted: boolean;
};

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
}

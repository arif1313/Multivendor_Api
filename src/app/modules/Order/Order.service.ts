import { AppError } from "../../utils/AppError";
import { buildMeta, buildPagination } from "../../utils/queryHelper";
import { TPricedItem, groupByVendor, unitPrice } from "../../utils/pricing";
import { CartServices, TCartOwner } from "../Cart/Cart.service";
import { IProductDocument } from "../Product/Product.interface";
import { ProductModel } from "../Product/Product.model";
import {
  ICustomerInfo,
  IOrderDocument,
  TOrderStatus,
  TPaymentMethod,
} from "./Order.interface";
import { OrderModel } from "./Order.model";

export type TCreateOrderPayload = {
  productId?: string;
  quantity?: number;
  customerInfo: ICustomerInfo;
  paymentMethod?: TPaymentMethod;
};

const generateOrderNumber = (suffix: number): string =>
  `ORD-${Date.now().toString(36).toUpperCase()}-${String(suffix).padStart(2, "0")}`;

const getSellableProduct = async (productId: string): Promise<IProductDocument> => {
  const product = await ProductModel.findOne({
    _id: productId,
    isDeleted: false,
    isBlocked: false,
    isActive: true,
  });
  if (!product) throw new AppError(404, "Product is not available");
  return product;
};

/** Every product in the order must accept the chosen payment method. */
const assertPaymentMethodAllowed = (items: TPricedItem[], paymentMethod: TPaymentMethod) => {
  if (paymentMethod !== "cod") {
    throw new AppError(501, "bKash payment is not available yet, please use cash on delivery");
  }

  const notAllowed = items.find(({ product }) => product.paymentOptions === "bkash");
  if (notAllowed) {
    throw new AppError(
      400,
      `"${notAllowed.product.name}" does not accept cash on delivery`
    );
  }
};

const collectOrderItems = async (
  owner: TCartOwner,
  payload: TCreateOrderPayload
): Promise<TPricedItem[]> => {
  if (payload.productId) {
    const product = await getSellableProduct(payload.productId);
    return [{ product, quantity: payload.quantity || 1 }];
  }

  const cart = await CartServices.getOrCreateCart(owner);
  if (!cart.items.length) throw new AppError(400, "Your cart is empty");

  const items: TPricedItem[] = [];
  for (const item of cart.items) {
    // sequential so an unavailable product reports its own message
     
    const product = await getSellableProduct(String(item.productId));
    items.push({ product, quantity: item.quantity });
  }
  return items;
};

const assertStock = (items: TPricedItem[]) => {
  const outOfStock = items.find(
    ({ product, quantity }) => product.stock > 0 && quantity > product.stock
  );
  if (outOfStock) {
    throw new AppError(
      400,
      `Only ${outOfStock.product.stock} item(s) of "${outOfStock.product.name}" left in stock`
    );
  }
};

/** Creates one order per vendor; grand total = product total + delivery charge. */
const createOrder = async (owner: TCartOwner, payload: TCreateOrderPayload) => {
  const paymentMethod = payload.paymentMethod || "cod";
  const items = await collectOrderItems(owner, payload);

  assertPaymentMethodAllowed(items, paymentMethod);
  assertStock(items);

  const groups = groupByVendor(items);
  const parentOrderId = groups.length > 1 ? generateOrderNumber(0) : undefined;

  const orders: IOrderDocument[] = [];
  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
     
    const order = await OrderModel.create({
      orderNumber: generateOrderNumber(index + 1),
      parentOrderId,
      customerId: owner.customerId,
      guestId: owner.guestId,
      vendorId: group.vendorId,
      items: group.items.map(({ product, quantity }) => ({
        productId: product._id,
        name: product.name,
        image: product.images?.[0],
        unitPrice: unitPrice(product),
        quantity,
        subtotal: unitPrice(product) * quantity,
      })),
      customerInfo: payload.customerInfo,
      productTotal: group.productTotal,
      deliveryCharge: group.deliveryCharge,
      grandTotal: group.grandTotal,
      paymentMethod,
      paymentStatus: "unpaid",
      paidAmount: 0,
      dueAmount: group.grandTotal,
    });
    orders.push(order);
  }

  await Promise.all(
    items.map(({ product, quantity }) =>
      ProductModel.updateOne({ _id: product._id, stock: { $gte: quantity } }, { $inc: { stock: -quantity } })
    )
  );

  if (!payload.productId) await CartServices.clearCart(owner);

  return { parentOrderId, orders };
};

const buildOrderFilter = (query: Record<string, unknown>) => {
  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.vendorId) filter.vendorId = query.vendorId;
  if (query.customerId) filter.customerId = query.customerId;
  if (query.orderStatus) filter.orderStatus = query.orderStatus;
  if (query.paymentMethod) filter.paymentMethod = query.paymentMethod;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.searchTerm) {
    const regex = { $regex: String(query.searchTerm), $options: "i" };
    filter.$or = [
      { orderNumber: regex },
      { "customerInfo.name": regex },
      { "customerInfo.phone": regex },
    ];
  }
  return filter;
};

const getOrders = async (query: Record<string, unknown>) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildOrderFilter(query);

  const [data, total] = await Promise.all([
    OrderModel.find(filter)
      .populate("vendorId", "shopName slug logo")
      .populate("customerId", "name email contactNumber")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    OrderModel.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getMyOrders = async (owner: TCartOwner, query: Record<string, unknown>) => {
  const scope = owner.customerId ? { customerId: owner.customerId } : { guestId: owner.guestId };
  return getOrders({ ...query, ...scope });
};

const getOrderById = async (id: string) => {
  const byNumber = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderNumber: id };
  const order = await OrderModel.findOne({ ...byNumber, isDeleted: false })
    .populate("vendorId", "shopName slug logo contactNumber address")
    .populate("customerId", "name email contactNumber");
  if (!order) throw new AppError(404, "Order not found");
  return order;
};

const allowedTransitions: Record<TOrderStatus, TOrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const updateOrderStatus = async (
  orderId: string,
  orderStatus: TOrderStatus,
  options: { vendorId?: string; cancelReason?: string } = {}
) => {
  const order = await OrderModel.findOne({ _id: orderId, isDeleted: false });
  if (!order) throw new AppError(404, "Order not found");
  if (options.vendorId && String(order.vendorId) !== options.vendorId) {
    throw new AppError(403, "This order belongs to another vendor");
  }

  if (!allowedTransitions[order.orderStatus].includes(orderStatus)) {
    throw new AppError(400, `Cannot change status from ${order.orderStatus} to ${orderStatus}`);
  }

  if (orderStatus === "cancelled") {
    order.cancelReason = options.cancelReason;
    await Promise.all(
      order.items.map((item) =>
        ProductModel.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } })
      )
    );
  }

  // COD is settled once the parcel is delivered.
  if (orderStatus === "delivered" && order.paymentMethod === "cod") {
    order.paymentStatus = "paid";
    order.paidAmount = order.grandTotal;
    order.dueAmount = 0;
  }

  order.orderStatus = orderStatus;
  await order.save();
  return order;
};

const softDeleteOrder = async (id: string) => {
  const order = await OrderModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!order) throw new AppError(404, "Order not found");
  return order;
};

export const OrderServices = {
  createOrder,
  getOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  softDeleteOrder,
};

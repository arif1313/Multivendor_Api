import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { resolveCartOwner } from "../Cart/Cart.controller";
import { VendorServices } from "../Vendor/Vendor.service";
import { OrderServices } from "./Order.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.createOrder(resolveCartOwner(req), req.body);
  sendResponse(res, { statusCode: 201, message: "Order placed successfully", data: result });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await OrderServices.getMyOrders(resolveCartOwner(req), req.query);
  sendResponse(res, { message: "Orders retrieved", meta, data });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const order = await OrderServices.getOrderById(req.params.id);

  const owner = resolveCartOwner(req);
  const isOwner =
    (owner.customerId && String(order.customerId?._id || order.customerId) === owner.customerId) ||
    (owner.guestId && order.guestId === owner.guestId);
  if (req.user?.role !== "admin" && !isOwner) {
    throw new AppError(403, "You cannot view this order");
  }

  sendResponse(res, { message: "Order retrieved", data: order });
});

const getVendorOrders = catchAsync(async (req: Request, res: Response) => {
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  const { data, meta } = await OrderServices.getOrders({
    ...req.query,
    vendorId: String(vendor._id),
  });
  sendResponse(res, { message: "Orders retrieved", meta, data });
});

const updateVendorOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  const result = await OrderServices.updateOrderStatus(req.params.id, req.body.orderStatus, {
    vendorId: String(vendor._id),
    cancelReason: req.body.cancelReason,
  });
  sendResponse(res, { message: "Order status updated", data: result });
});

const getAllOrdersForAdmin = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await OrderServices.getOrders(req.query);
  sendResponse(res, { message: "Orders retrieved", meta, data });
});

const updateOrderStatusForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.updateOrderStatus(req.params.id, req.body.orderStatus, {
    cancelReason: req.body.cancelReason,
  });
  sendResponse(res, { message: "Order status updated", data: result });
});

const softDeleteOrderForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderServices.softDeleteOrder(req.params.id);
  sendResponse(res, { message: "Order soft deleted", data: result });
});

export const OrderControllers = {
  createOrder,
  getMyOrders,
  getOrderById,
  getVendorOrders,
  updateVendorOrderStatus,
  getAllOrdersForAdmin,
  updateOrderStatusForAdmin,
  softDeleteOrderForAdmin,
};

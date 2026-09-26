import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { VendorServices } from "../Vendor/Vendor.service";
import { SubscriptionServices } from "./Subscription.service";

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.createSubscription(req.body);
  sendResponse(res, { statusCode: 201, message: "Subscription created", data: result });
});

const getSubscriptions = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await SubscriptionServices.getSubscriptions(req.query);
  sendResponse(res, { message: "Subscriptions retrieved", meta, data });
});

const getMySubscriptions = catchAsync(async (req: Request, res: Response) => {
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  const { data, meta } = await SubscriptionServices.getSubscriptions({
    ...req.query,
    vendorId: String(vendor._id),
  });
  sendResponse(res, { message: "Subscriptions retrieved", meta, data });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.updateSubscription(req.params.id, req.body);
  sendResponse(res, { message: "Subscription updated", data: result });
});

const softDeleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.softDeleteSubscription(req.params.id);
  sendResponse(res, { message: "Subscription soft deleted", data: result });
});

export const SubscriptionControllers = {
  createSubscription,
  getSubscriptions,
  getMySubscriptions,
  updateSubscription,
  softDeleteSubscription,
};

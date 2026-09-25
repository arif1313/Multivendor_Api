import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { VendorServices } from "./Vendor.service";

const getPublicVendors = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await VendorServices.getVendors(req.query);
  sendResponse(res, { message: "Shops retrieved", meta, data });
});

const getVendorStorefront = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorServices.getVendorStorefront(req.params.idOrSlug);
  sendResponse(res, { message: "Shop retrieved", data: result });
});

const getMyShop = catchAsync(async (req: Request, res: Response) => {
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  sendResponse(res, { message: "Shop profile retrieved", data: vendor });
});

const updateMyShop = catchAsync(async (req: Request, res: Response) => {
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  if (files?.logo?.[0]) req.body.logo = `/uploads/${files.logo[0].filename}`;
  if (files?.banner?.[0]) req.body.banner = `/uploads/${files.banner[0].filename}`;

  const result = await VendorServices.updateVendor(String(vendor._id), req.body);
  sendResponse(res, { message: "Shop profile updated", data: result });
});

const getAllVendorsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await VendorServices.getVendors(req.query, true);
  sendResponse(res, { message: "Vendors retrieved", meta, data });
});

const getVendorByIdForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorServices.getVendorById(req.params.id);
  sendResponse(res, { message: "Vendor retrieved", data: result });
});

const updateVendorByAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorServices.updateVendor(req.params.id, req.body);
  sendResponse(res, { message: "Vendor updated", data: result });
});

const setVendorBlockStatus = catchAsync(async (req: Request, res: Response) => {
  const { isBlocked } = req.body;
  if (typeof isBlocked !== "boolean") throw new AppError(400, "isBlocked must be a boolean");
  const result = await VendorServices.setVendorBlockStatus(req.params.id, isBlocked);
  sendResponse(res, { message: `Vendor ${isBlocked ? "blocked" : "unblocked"}`, data: result });
});

const softDeleteVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorServices.softDeleteVendor(req.params.id);
  sendResponse(res, { message: "Vendor soft deleted", data: result });
});

const restoreVendor = catchAsync(async (req: Request, res: Response) => {
  const result = await VendorServices.restoreVendor(req.params.id);
  sendResponse(res, { message: "Vendor restored", data: result });
});

export const VendorControllers = {
  getPublicVendors,
  getVendorStorefront,
  getMyShop,
  updateMyShop,
  getAllVendorsForAdmin,
  getVendorByIdForAdmin,
  updateVendorByAdmin,
  setVendorBlockStatus,
  softDeleteVendor,
  restoreVendor,
};

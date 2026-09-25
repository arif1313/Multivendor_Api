import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { filesToPaths } from "../../../uploads";
import { VendorServices } from "../Vendor/Vendor.service";
import { ProductServices } from "./Product.service";

const attachImages = (req: Request) => {
  const uploaded = filesToPaths(req.files as Express.Multer.File[] | undefined);
  if (uploaded.length) {
    const existing = Array.isArray(req.body.images) ? req.body.images : [];
    req.body.images = [...existing, ...uploaded];
  }
};

const createProduct = catchAsync(async (req: Request, res: Response) => {
  attachImages(req);
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  const result = await ProductServices.createProduct(String(vendor._id), req.body);
  sendResponse(res, { statusCode: 201, message: "Product created", data: result });
});

const getMyProducts = catchAsync(async (req: Request, res: Response) => {
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  const { data, meta } = await ProductServices.getVendorProducts(String(vendor._id), req.query);
  sendResponse(res, { message: "Products retrieved", meta, data });
});

const updateMyProduct = catchAsync(async (req: Request, res: Response) => {
  attachImages(req);
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  const result = await ProductServices.updateProduct(req.params.id, req.body, String(vendor._id));
  sendResponse(res, { message: "Product updated", data: result });
});

const deleteMyProduct = catchAsync(async (req: Request, res: Response) => {
  const vendor = await VendorServices.getVendorByUserId(req.user!.userId);
  const result = await ProductServices.softDeleteProduct(req.params.id, String(vendor._id));
  sendResponse(res, { message: "Product soft deleted", data: result });
});

const getPublicProducts = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ProductServices.getProducts(req.query);
  sendResponse(res, { message: "Products retrieved", meta, data });
});

const getPublicProductById = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.getPublicProductById(req.params.idOrSlug);
  sendResponse(res, { message: "Product retrieved", data: result });
});

const getAllProductsForAdmin = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ProductServices.getProducts(req.query, true);
  sendResponse(res, { message: "Products retrieved", meta, data });
});

const createProductForAdmin = catchAsync(async (req: Request, res: Response) => {
  attachImages(req);
  const { vendorId, ...rest } = req.body;
  if (!vendorId) throw new AppError(400, "vendorId is required");
  const result = await ProductServices.createProductAsAdmin(vendorId, rest);
  sendResponse(res, { statusCode: 201, message: "Product created", data: result });
});

const updateProductForAdmin = catchAsync(async (req: Request, res: Response) => {
  attachImages(req);
  const result = await ProductServices.updateProduct(req.params.id, req.body);
  sendResponse(res, { message: "Product updated", data: result });
});

const setProductBlockStatus = catchAsync(async (req: Request, res: Response) => {
  const { isBlocked } = req.body;
  if (typeof isBlocked !== "boolean") throw new AppError(400, "isBlocked must be a boolean");
  const result = await ProductServices.setProductBlockStatus(req.params.id, isBlocked);
  sendResponse(res, { message: `Product ${isBlocked ? "blocked" : "unblocked"}`, data: result });
});

const softDeleteProductForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.softDeleteProduct(req.params.id);
  sendResponse(res, { message: "Product soft deleted", data: result });
});

const restoreProductForAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await ProductServices.restoreProduct(req.params.id);
  sendResponse(res, { message: "Product restored", data: result });
});

export const ProductControllers = {
  createProduct,
  getMyProducts,
  updateMyProduct,
  deleteMyProduct,
  getPublicProducts,
  getPublicProductById,
  getAllProductsForAdmin,
  createProductForAdmin,
  updateProductForAdmin,
  setProductBlockStatus,
  softDeleteProductForAdmin,
  restoreProductForAdmin,
};

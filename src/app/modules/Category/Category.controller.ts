import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CategoryServices } from "./Category.service";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  if (req.file) req.body.image = `/uploads/${req.file.filename}`;
  const result = await CategoryServices.createCategory(req.body);
  sendResponse(res, { statusCode: 201, message: "Category created", data: result });
});

const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await CategoryServices.getCategories();
  sendResponse(res, { message: "Categories retrieved", data: result });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.getCategoryById(req.params.id);
  sendResponse(res, { message: "Category retrieved", data: result });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  if (req.file) req.body.image = `/uploads/${req.file.filename}`;
  const result = await CategoryServices.updateCategory(req.params.id, req.body);
  sendResponse(res, { message: "Category updated", data: result });
});

const softDeleteCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await CategoryServices.softDeleteCategory(req.params.id);
  sendResponse(res, { message: "Category soft deleted", data: result });
});

export const CategoryControllers = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  softDeleteCategory,
};

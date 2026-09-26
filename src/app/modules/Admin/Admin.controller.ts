import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminServices } from "./Admin.service";

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getDashboardStats();
  sendResponse(res, { message: "Dashboard stats retrieved", data: result });
});

export const AdminControllers = { getDashboardStats };

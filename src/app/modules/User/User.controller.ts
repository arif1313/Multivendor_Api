import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AppError } from "../../utils/AppError";
import { UserServices } from "./User.service";

const registerCustomer = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.registerCustomer(req.body);
  sendResponse(res, { statusCode: 201, message: "Customer registered successfully", data: result });
});

const registerVendor = catchAsync(async (req: Request, res: Response) => {
  if (req.file) req.body.logo = `/uploads/${req.file.filename}`;
  const result = await UserServices.registerVendor(req.body);
  sendResponse(res, { statusCode: 201, message: "Vendor registered successfully", data: result });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password, guestId } = req.body;
  const result = await UserServices.login(email, password, guestId || req.guestId);
  sendResponse(res, { message: "Logged in successfully", data: result });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.refreshAccessToken(req.body.refreshToken);
  sendResponse(res, { message: "Access token refreshed", data: result });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.changePassword(
    req.user!.userId,
    req.body.oldPassword,
    req.body.newPassword
  );
  sendResponse(res, { message: result.message });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getMe(req.user!.userId);
  sendResponse(res, { message: "Profile retrieved", data: result });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
  if (req.file) req.body.profileImage = `/uploads/${req.file.filename}`;
  const result = await UserServices.updateMe(req.user!.userId, req.body);
  sendResponse(res, { message: "Profile updated", data: result });
});

const getCustomers = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await UserServices.getUsers({ ...req.query, role: "customer" });
  sendResponse(res, { message: "Customers retrieved", meta, data });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await UserServices.getUsers(req.query);
  sendResponse(res, { message: "Users retrieved", meta, data });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.getUserById(req.params.id);
  sendResponse(res, { message: "User retrieved", data: result });
});

const setBlockStatus = catchAsync(async (req: Request, res: Response) => {
  const { isBlocked } = req.body;
  if (typeof isBlocked !== "boolean") throw new AppError(400, "isBlocked must be a boolean");
  const result = await UserServices.setUserBlockStatus(req.params.id, isBlocked);
  sendResponse(res, { message: `User ${isBlocked ? "blocked" : "unblocked"}`, data: result });
});

const softDeleteUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.softDeleteUser(req.params.id);
  sendResponse(res, { message: "User soft deleted", data: result });
});

const restoreUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.restoreUser(req.params.id);
  sendResponse(res, { message: "User restored", data: result });
});

export const UserControllers = {
  registerCustomer,
  registerVendor,
  login,
  refreshToken,
  changePassword,
  getMe,
  updateMe,
  getCustomers,
  getUsers,
  getUserById,
  setBlockStatus,
  softDeleteUser,
  restoreUser,
};

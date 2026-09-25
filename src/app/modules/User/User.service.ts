import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from "../../../config";
import { AppError } from "../../utils/AppError";
import { uniqueSlug } from "../../utils/slugify";
import { buildMeta, buildPagination } from "../../utils/queryHelper";
import { VendorModel } from "../Vendor/Vendor.model";
import { IVendorDocument } from "../Vendor/Vendor.interface";
import { CartServices } from "../Cart/Cart.service";
import { IUser, IUserDocument, TUserRole } from "./User.interface";
import { UserModel } from "./User.model";

type TTokens = { accessToken: string; refreshToken: string };

const createTokens = (user: IUserDocument): TTokens => {
  const payload = { userId: String(user._id), email: user.email, role: user.role };
  const accessToken = jwt.sign(payload, config.jwt.accessSecret as Secret, {
    expiresIn: config.jwt.accessExpiresIn,
  } as SignOptions);
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret as Secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions);
  return { accessToken, refreshToken };
};

const registerCustomer = async (payload: Partial<IUser>) => {
  const user = await UserModel.create({ ...payload, role: "customer" });
  return { user: user.toJSON(), ...createTokens(user) };
};

type TVendorRegisterPayload = Partial<IUser> & {
  shopName: string;
  brandName?: string;
  description?: string;
  logo?: string;
};

const registerVendor = async (payload: TVendorRegisterPayload) => {
  const { shopName, brandName, description, logo, address, ...userPart } = payload;

  const user = await UserModel.create({ ...userPart, address, role: "vendor" });

  let vendor: IVendorDocument;
  try {
    vendor = await VendorModel.create({
      userId: user._id,
      shopName,
      brandName,
      description,
      logo,
      address,
      contactNumber: user.contactNumber,
      slug: await uniqueSlug(VendorModel, shopName),
    });
  } catch (error) {
    // keep the two records consistent when the shop profile fails
    await UserModel.findByIdAndDelete(user._id);
    throw error;
  }

  return { user: user.toJSON(), vendor, ...createTokens(user) };
};

const login = async (email: string, password: string, guestId?: string) => {
  const user = await UserModel.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || user.isDeleted) throw new AppError(401, "Invalid email or password");
  if (user.isBlocked) throw new AppError(403, "Your account is blocked");

  const matched = await user.comparePassword(password);
  if (!matched) throw new AppError(401, "Invalid email or password");

  if (guestId && user.role === "customer") {
    await CartServices.mergeGuestCart(guestId, String(user._id));
  }

  const vendor = user.role === "vendor" ? await VendorModel.findOne({ userId: user._id }) : null;

  return { user: user.toJSON(), vendor, ...createTokens(user) };
};

const refreshAccessToken = async (refreshToken: string) => {
  let decoded: { userId: string };
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
  } catch {
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await UserModel.findById(decoded.userId);
  if (!user || user.isDeleted) throw new AppError(401, "User no longer exists");
  if (user.isBlocked) throw new AppError(403, "Your account is blocked");

  return { accessToken: createTokens(user).accessToken };
};

const changePassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const user = await UserModel.findById(userId).select("+password");
  if (!user) throw new AppError(404, "User not found");

  const matched = await user.comparePassword(oldPassword);
  if (!matched) throw new AppError(400, "Old password is incorrect");

  user.password = newPassword;
  await user.save();
  return { message: "Password changed" };
};

const getMe = async (userId: string) => {
  const user = await UserModel.findById(userId);
  if (!user || user.isDeleted) throw new AppError(404, "User not found");

  const vendor = user.role === "vendor" ? await VendorModel.findOne({ userId: user._id }) : null;
  return { user: user.toJSON(), vendor };
};

const updateMe = async (userId: string, payload: Partial<IUser>) => {
  const user = await UserModel.findOneAndUpdate({ _id: userId, isDeleted: false }, payload, {
    new: true,
    runValidators: true,
  });
  if (!user) throw new AppError(404, "User not found");
  return user.toJSON();
};

type TUserQuery = Record<string, unknown> & { role?: TUserRole };

const getUsers = async (query: TUserQuery) => {
  const { page, limit, skip, sort } = buildPagination(query);

  const filter: Record<string, unknown> = { isDeleted: false };
  if (query.role) filter.role = query.role;
  if (query.isBlocked !== undefined) filter.isBlocked = query.isBlocked === "true";
  if (query.includeDeleted === "true") delete filter.isDeleted;
  if (query.searchTerm) {
    const regex = { $regex: String(query.searchTerm), $options: "i" };
    filter.$or = [{ name: regex }, { email: regex }, { contactNumber: regex }];
  }

  const [data, total] = await Promise.all([
    UserModel.find(filter).sort(sort).skip(skip).limit(limit),
    UserModel.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getUserById = async (id: string) => {
  const user = await UserModel.findById(id);
  if (!user) throw new AppError(404, "User not found");
  return user;
};

const setUserBlockStatus = async (id: string, isBlocked: boolean) => {
  const user = await UserModel.findByIdAndUpdate(id, { isBlocked }, { new: true });
  if (!user) throw new AppError(404, "User not found");
  return user;
};

const softDeleteUser = async (id: string) => {
  const user = await UserModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!user) throw new AppError(404, "User not found");
  return user;
};

const restoreUser = async (id: string) => {
  const user = await UserModel.findByIdAndUpdate(id, { isDeleted: false }, { new: true });
  if (!user) throw new AppError(404, "User not found");
  return user;
};

export const UserServices = {
  registerCustomer,
  registerVendor,
  login,
  refreshAccessToken,
  changePassword,
  getMe,
  updateMe,
  getUsers,
  getUserById,
  setUserBlockStatus,
  softDeleteUser,
  restoreUser,
};

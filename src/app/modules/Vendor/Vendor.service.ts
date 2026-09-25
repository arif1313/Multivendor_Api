import { AppError } from "../../utils/AppError";
import { buildMeta, buildPagination } from "../../utils/queryHelper";
import { ProductModel } from "../Product/Product.model";
import { UserModel } from "../User/User.model";
import { IVendor, IVendorDocument } from "./Vendor.interface";
import { VendorModel } from "./Vendor.model";

/** Resolves the vendor profile owned by the logged in vendor user. */
const getVendorByUserId = async (userId: string): Promise<IVendorDocument> => {
  const vendor = await VendorModel.findOne({ userId, isDeleted: false });
  if (!vendor) throw new AppError(404, "Vendor profile not found");
  return vendor;
};

const getVendors = async (query: Record<string, unknown>, isAdminView = false) => {
  const { page, limit, skip, sort } = buildPagination(query);

  const filter: Record<string, unknown> = {};
  if (!isAdminView) {
    filter.isDeleted = false;
    filter.isBlocked = false;
  } else {
    if (query.isDeleted !== undefined) filter.isDeleted = query.isDeleted === "true";
    if (query.isBlocked !== undefined) filter.isBlocked = query.isBlocked === "true";
  }
  if (query.searchTerm) {
    const regex = { $regex: String(query.searchTerm), $options: "i" };
    filter.$or = [{ shopName: regex }, { brandName: regex }, { address: regex }];
  }

  const [data, total] = await Promise.all([
    VendorModel.find(filter).populate("userId", "name email contactNumber isBlocked").sort(sort).skip(skip).limit(limit),
    VendorModel.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

/** Public shop page: shop info + its active products. */
const getVendorStorefront = async (idOrSlug: string) => {
  const byId = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
  const vendor = await VendorModel.findOne({ ...byId, isDeleted: false, isBlocked: false });
  if (!vendor) throw new AppError(404, "Shop not found");

  const products = await ProductModel.find({
    vendorId: vendor._id,
    isDeleted: false,
    isBlocked: false,
  }).sort({ createdAt: -1 });

  return { vendor, products, productCount: products.length };
};

const getVendorById = async (id: string) => {
  const vendor = await VendorModel.findById(id).populate("userId", "name email contactNumber");
  if (!vendor) throw new AppError(404, "Vendor not found");
  return vendor;
};

const updateVendor = async (vendorId: string, payload: Partial<IVendor>) => {
  const vendor = await VendorModel.findOneAndUpdate({ _id: vendorId, isDeleted: false }, payload, {
    new: true,
    runValidators: true,
  });
  if (!vendor) throw new AppError(404, "Vendor not found");
  return vendor;
};

/** Blocking a shop also hides its products from the public storefront. */
const setVendorBlockStatus = async (vendorId: string, isBlocked: boolean) => {
  const vendor = await VendorModel.findByIdAndUpdate(vendorId, { isBlocked }, { new: true });
  if (!vendor) throw new AppError(404, "Vendor not found");

  await Promise.all([
    UserModel.findByIdAndUpdate(vendor.userId, { isBlocked }),
    ProductModel.updateMany({ vendorId: vendor._id }, { isBlocked }),
  ]);

  return vendor;
};

const softDeleteVendor = async (vendorId: string) => {
  const vendor = await VendorModel.findByIdAndUpdate(vendorId, { isDeleted: true }, { new: true });
  if (!vendor) throw new AppError(404, "Vendor not found");

  await Promise.all([
    UserModel.findByIdAndUpdate(vendor.userId, { isDeleted: true }),
    ProductModel.updateMany({ vendorId: vendor._id }, { isDeleted: true }),
  ]);

  return vendor;
};

const restoreVendor = async (vendorId: string) => {
  const vendor = await VendorModel.findByIdAndUpdate(vendorId, { isDeleted: false }, { new: true });
  if (!vendor) throw new AppError(404, "Vendor not found");

  await Promise.all([
    UserModel.findByIdAndUpdate(vendor.userId, { isDeleted: false }),
    ProductModel.updateMany({ vendorId: vendor._id }, { isDeleted: false }),
  ]);

  return vendor;
};

export const VendorServices = {
  getVendorByUserId,
  getVendors,
  getVendorStorefront,
  getVendorById,
  updateVendor,
  setVendorBlockStatus,
  softDeleteVendor,
  restoreVendor,
};

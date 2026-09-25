import { AppError } from "../../utils/AppError";
import { buildMeta, buildPagination } from "../../utils/queryHelper";
import { uniqueSlug } from "../../utils/slugify";
import { VendorModel } from "../Vendor/Vendor.model";
import { IProduct } from "./Product.interface";
import { ProductModel } from "./Product.model";

const createProduct = async (vendorId: string, payload: Partial<IProduct>) => {
  const slug = await uniqueSlug(ProductModel, payload.name as string);
  return ProductModel.create({ ...payload, vendorId, slug });
};

const buildProductFilter = (query: Record<string, unknown>, isAdminView = false) => {
  const filter: Record<string, unknown> = {};

  if (!isAdminView) {
    filter.isDeleted = false;
    filter.isBlocked = false;
    filter.isActive = true;
  } else {
    if (query.isDeleted !== undefined) filter.isDeleted = query.isDeleted === "true";
    if (query.isBlocked !== undefined) filter.isBlocked = query.isBlocked === "true";
  }

  if (query.vendorId) filter.vendorId = query.vendorId;
  if (query.categoryId) filter.categoryId = query.categoryId;
  if (query.paymentOptions) filter.paymentOptions = query.paymentOptions;
  if (query.inStock === "true") filter.stock = { $gt: 0 };

  const minPrice = query.minPrice !== undefined ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice !== undefined ? Number(query.maxPrice) : undefined;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {
      ...(minPrice !== undefined ? { $gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { $lte: maxPrice } : {}),
    };
  }

  if (query.searchTerm) {
    const regex = { $regex: String(query.searchTerm), $options: "i" };
    filter.$or = [{ name: regex }, { description: regex }, { brand: regex }];
  }

  return filter;
};

const getProducts = async (query: Record<string, unknown>, isAdminView = false) => {
  const { page, limit, skip, sort } = buildPagination(query);
  const filter = buildProductFilter(query, isAdminView);

  const [data, total] = await Promise.all([
    ProductModel.find(filter)
      .populate("vendorId", "shopName brandName slug logo avgRating")
      .populate("categoryId", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ProductModel.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getPublicProductById = async (idOrSlug: string) => {
  const byId = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
  const product = await ProductModel.findOne({ ...byId, isDeleted: false, isBlocked: false })
    .populate("vendorId", "shopName brandName slug logo description address contactNumber avgRating ratingCount")
    .populate("categoryId", "name slug");
  if (!product) throw new AppError(404, "Product not found");
  return product;
};

const getVendorProducts = async (vendorId: string, query: Record<string, unknown>) => {
  const { page, limit, skip, sort } = buildPagination(query);

  const filter: Record<string, unknown> = { vendorId, isDeleted: false };
  if (query.includeDeleted === "true") delete filter.isDeleted;
  if (query.searchTerm) filter.name = { $regex: String(query.searchTerm), $options: "i" };

  const [data, total] = await Promise.all([
    ProductModel.find(filter).populate("categoryId", "name slug").sort(sort).skip(skip).limit(limit),
    ProductModel.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

/** Vendors may only touch their own products; admin bypasses the ownership check. */
const getOwnedProduct = async (productId: string, vendorId?: string) => {
  const product = await ProductModel.findOne({ _id: productId, isDeleted: false });
  if (!product) throw new AppError(404, "Product not found");
  if (vendorId && String(product.vendorId) !== vendorId) {
    throw new AppError(403, "This product belongs to another vendor");
  }
  return product;
};

const updateProduct = async (productId: string, payload: Partial<IProduct>, vendorId?: string) => {
  const product = await getOwnedProduct(productId, vendorId);

  if (payload.name && payload.name !== product.name) {
    payload.slug = await uniqueSlug(ProductModel, payload.name);
  }

  Object.assign(product, payload);
  await product.save();
  return product;
};

const softDeleteProduct = async (productId: string, vendorId?: string) => {
  const product = await getOwnedProduct(productId, vendorId);
  product.isDeleted = true;
  await product.save();
  return product;
};

const restoreProduct = async (productId: string) => {
  const product = await ProductModel.findByIdAndUpdate(productId, { isDeleted: false }, { new: true });
  if (!product) throw new AppError(404, "Product not found");
  return product;
};

const setProductBlockStatus = async (productId: string, isBlocked: boolean) => {
  const product = await ProductModel.findByIdAndUpdate(productId, { isBlocked }, { new: true });
  if (!product) throw new AppError(404, "Product not found");
  return product;
};

/** Admin can create a product on behalf of any vendor. */
const createProductAsAdmin = async (vendorId: string, payload: Partial<IProduct>) => {
  const vendor = await VendorModel.findOne({ _id: vendorId, isDeleted: false });
  if (!vendor) throw new AppError(404, "Vendor not found");
  return createProduct(vendorId, payload);
};

export const ProductServices = {
  createProduct,
  createProductAsAdmin,
  getProducts,
  getPublicProductById,
  getVendorProducts,
  getOwnedProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  setProductBlockStatus,
};

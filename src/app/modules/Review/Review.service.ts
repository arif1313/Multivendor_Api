import { Types } from "mongoose";
import { AppError } from "../../utils/AppError";
import { buildMeta, buildPagination } from "../../utils/queryHelper";
import { ProductModel } from "../Product/Product.model";
import { VendorModel } from "../Vendor/Vendor.model";
import { IReviewDocument } from "./Review.interface";
import { ReviewModel } from "./Review.model";

export type TReviewer = { customerId?: string; guestId?: string; reviewerName?: string };

/** Recomputes avgRating / ratingCount on the reviewed product and shop. */
const recalculateRatings = async (productId?: Types.ObjectId, vendorId?: Types.ObjectId) => {
  if (productId) {
    const [stats] = await ReviewModel.aggregate([
      { $match: { productId, isDeleted: false } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await ProductModel.findByIdAndUpdate(productId, {
      avgRating: Number((stats?.avgRating || 0).toFixed(2)),
      ratingCount: stats?.count || 0,
    });
  }

  if (vendorId) {
    const [stats] = await ReviewModel.aggregate([
      { $match: { vendorId, isDeleted: false } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await VendorModel.findByIdAndUpdate(vendorId, {
      avgRating: Number((stats?.avgRating || 0).toFixed(2)),
      ratingCount: stats?.count || 0,
    });
  }
};

const createProductReview = async (
  productId: string,
  reviewer: TReviewer,
  payload: { rating: number; comment?: string }
): Promise<IReviewDocument> => {
  const product = await ProductModel.findOne({ _id: productId, isDeleted: false });
  if (!product) throw new AppError(404, "Product not found");

  const review = await ReviewModel.create({
    ...payload,
    productId: product._id,
    vendorId: product.vendorId,
    customerId: reviewer.customerId,
    guestId: reviewer.guestId,
    reviewerName: reviewer.reviewerName || "Guest",
  });

  await recalculateRatings(product._id, product.vendorId);
  return review;
};

const createVendorReview = async (
  vendorId: string,
  reviewer: TReviewer,
  payload: { rating: number; comment?: string }
): Promise<IReviewDocument> => {
  const vendor = await VendorModel.findOne({ _id: vendorId, isDeleted: false });
  if (!vendor) throw new AppError(404, "Shop not found");

  const review = await ReviewModel.create({
    ...payload,
    vendorId: vendor._id,
    customerId: reviewer.customerId,
    guestId: reviewer.guestId,
    reviewerName: reviewer.reviewerName || "Guest",
  });

  await recalculateRatings(undefined, vendor._id);
  return review;
};

const getReviews = async (filter: Record<string, unknown>, query: Record<string, unknown>) => {
  const { page, limit, skip, sort } = buildPagination(query);

  const [data, total] = await Promise.all([
    ReviewModel.find({ ...filter, isDeleted: false })
      .populate("customerId", "name")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    ReviewModel.countDocuments({ ...filter, isDeleted: false }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const softDeleteReview = async (id: string) => {
  const review = await ReviewModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true });
  if (!review) throw new AppError(404, "Review not found");
  await recalculateRatings(review.productId, review.vendorId);
  return review;
};

export const ReviewServices = {
  createProductReview,
  createVendorReview,
  getReviews,
  softDeleteReview,
};

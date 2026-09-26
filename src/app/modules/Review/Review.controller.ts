import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ReviewServices, TReviewer } from "./Review.service";

const resolveReviewer = (req: Request): TReviewer => ({
  customerId: req.user?.role === "customer" ? req.user.userId : undefined,
  guestId: req.user ? undefined : req.guestId,
  reviewerName: req.body.reviewerName,
});

const createProductReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.createProductReview(req.params.productId, resolveReviewer(req), {
    rating: req.body.rating,
    comment: req.body.comment,
  });
  sendResponse(res, { statusCode: 201, message: "Review submitted", data: result });
});

const createVendorReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.createVendorReview(req.params.vendorId, resolveReviewer(req), {
    rating: req.body.rating,
    comment: req.body.comment,
  });
  sendResponse(res, { statusCode: 201, message: "Review submitted", data: result });
});

const getProductReviews = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ReviewServices.getReviews(
    { productId: req.params.id || req.params.productId },
    req.query
  );
  sendResponse(res, { message: "Reviews retrieved", meta, data });
});

const getVendorReviews = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ReviewServices.getReviews(
    { vendorId: req.params.id || req.params.vendorId },
    req.query
  );
  sendResponse(res, { message: "Reviews retrieved", meta, data });
});

const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const { data, meta } = await ReviewServices.getReviews({}, req.query);
  sendResponse(res, { message: "Reviews retrieved", meta, data });
});

const softDeleteReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewServices.softDeleteReview(req.params.id);
  sendResponse(res, { message: "Review soft deleted", data: result });
});

export const ReviewControllers = {
  createProductReview,
  createVendorReview,
  getProductReviews,
  getVendorReviews,
  getAllReviews,
  softDeleteReview,
};

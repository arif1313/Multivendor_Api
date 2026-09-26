import { Router } from "express";
import { optionalAuth } from "../../middlewares/auth";
import { guestSession } from "../../middlewares/guestSession";
import { validateRequest } from "../../middlewares/validateRequest";
import { ReviewControllers } from "./Review.controller";
import { createReviewValidation } from "./Review.validation";

const router = Router();

router.use(optionalAuth, guestSession);

router.post(
  "/product/:productId",
  validateRequest(createReviewValidation),
  ReviewControllers.createProductReview
);
router.post(
  "/vendor/:vendorId",
  validateRequest(createReviewValidation),
  ReviewControllers.createVendorReview
);
router.get("/product/:productId", ReviewControllers.getProductReviews);
router.get("/vendor/:vendorId", ReviewControllers.getVendorReviews);

export const ReviewRouters = router;

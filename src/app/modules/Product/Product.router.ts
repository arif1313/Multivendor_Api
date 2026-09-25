import { Router } from "express";
import { ReviewControllers } from "../Review/Review.controller";
import { ProductControllers } from "./Product.controller";

const router = Router();

router.get("/", ProductControllers.getPublicProducts);
router.get("/:idOrSlug", ProductControllers.getPublicProductById);
router.get("/:id/reviews", ReviewControllers.getProductReviews);

export const ProductRouters = router;

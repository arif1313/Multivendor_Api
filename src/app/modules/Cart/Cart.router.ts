import { Router } from "express";
import { optionalAuth } from "../../middlewares/auth";
import { guestSession } from "../../middlewares/guestSession";
import { validateRequest } from "../../middlewares/validateRequest";
import { CartControllers } from "./Cart.controller";
import { addToCartValidation, updateCartValidation } from "./Cart.validation";

const router = Router();

// Cart works without login: optionalAuth + a guest id cookie/header.
router.use(optionalAuth, guestSession);

router.get("/", CartControllers.getCart);
router.post("/add", validateRequest(addToCartValidation), CartControllers.addToCart);
router.put("/update", validateRequest(updateCartValidation), CartControllers.updateCartItem);
router.delete("/remove/:productId", CartControllers.removeCartItem);
router.delete("/clear", CartControllers.clearCart);

export const CartRouters = router;

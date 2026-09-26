import { Router } from "express";
import { upload } from "../../uploads";
import { auth } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { OrderControllers } from "../modules/Order/Order.controller";
import { updateOrderStatusValidation } from "../modules/Order/Order.validation";
import { ProductControllers } from "../modules/Product/Product.controller";
import {
  createProductValidation,
  updateProductValidation,
} from "../modules/Product/Product.validation";
import { SubscriptionControllers } from "../modules/Subscription/Subscription.controller";
import { VendorControllers } from "../modules/Vendor/Vendor.controller";

const router = Router();

router.use(auth("vendor"));

router.get("/profile", VendorControllers.getMyShop);

router.post(
  "/products",
  upload.array("images", 6),
  validateRequest(createProductValidation),
  ProductControllers.createProduct
);
router.get("/products", ProductControllers.getMyProducts);
router.put(
  "/products/:id",
  upload.array("images", 6),
  validateRequest(updateProductValidation),
  ProductControllers.updateMyProduct
);
router.patch(
  "/products/:id",
  upload.array("images", 6),
  validateRequest(updateProductValidation),
  ProductControllers.updateMyProduct
);
router.delete("/products/:id", ProductControllers.deleteMyProduct);

router.get("/orders", OrderControllers.getVendorOrders);
router.patch(
  "/orders/:id/status",
  validateRequest(updateOrderStatusValidation),
  OrderControllers.updateVendorOrderStatus
);

router.get("/subscriptions", SubscriptionControllers.getMySubscriptions);

export const VendorDashboardRouters = router;

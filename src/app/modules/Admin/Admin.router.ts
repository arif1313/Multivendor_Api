import { Router } from "express";
import { upload } from "../../../uploads";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { OrderControllers } from "../Order/Order.controller";
import { updateOrderStatusValidation } from "../Order/Order.validation";
import { ProductControllers } from "../Product/Product.controller";
import { updateProductValidation } from "../Product/Product.validation";
import { ReviewControllers } from "../Review/Review.controller";
import {
  createSubscriptionValidation,
  updateSubscriptionValidation,
} from "../Subscription/Subscription.validation";
import { SubscriptionControllers } from "../Subscription/Subscription.controller";
import { UserControllers } from "../User/User.controller";
import { VendorControllers } from "../Vendor/Vendor.controller";
import { updateVendorValidation } from "../Vendor/Vendor.validation";
import { AdminControllers } from "./Admin.controller";

const router = Router();

router.use(auth("admin"));

router.get("/dashboard-stats", AdminControllers.getDashboardStats);

// Vendors
router.get("/vendors", VendorControllers.getAllVendorsForAdmin);
router.get("/vendors/:id", VendorControllers.getVendorByIdForAdmin);
router.patch(
  "/vendors/:id",
  validateRequest(updateVendorValidation),
  VendorControllers.updateVendorByAdmin
);
router.patch("/vendors/:id/block", VendorControllers.setVendorBlockStatus);
router.delete("/vendors/:id", VendorControllers.softDeleteVendor);
router.patch("/vendors/:id/restore", VendorControllers.restoreVendor);

// Products (any vendor)
router.get("/products", ProductControllers.getAllProductsForAdmin);
router.post("/products", upload.array("images", 6), ProductControllers.createProductForAdmin);
router.patch(
  "/products/:id",
  upload.array("images", 6),
  validateRequest(updateProductValidation),
  ProductControllers.updateProductForAdmin
);
router.patch("/products/:id/block", ProductControllers.setProductBlockStatus);
router.delete("/products/:id", ProductControllers.softDeleteProductForAdmin);
router.patch("/products/:id/restore", ProductControllers.restoreProductForAdmin);

// Customers & users
router.get("/customers", UserControllers.getCustomers);
router.get("/users", UserControllers.getUsers);
router.get("/users/:id", UserControllers.getUserById);
router.patch("/users/:id/block", UserControllers.setBlockStatus);
router.delete("/users/:id", UserControllers.softDeleteUser);
router.patch("/users/:id/restore", UserControllers.restoreUser);

// Orders
router.get("/orders", OrderControllers.getAllOrdersForAdmin);
router.patch(
  "/orders/:id/status",
  validateRequest(updateOrderStatusValidation),
  OrderControllers.updateOrderStatusForAdmin
);
router.delete("/orders/:id", OrderControllers.softDeleteOrderForAdmin);

// Reviews moderation
router.get("/reviews", ReviewControllers.getAllReviews);
router.delete("/reviews/:id", ReviewControllers.softDeleteReview);

// Vendor subscriptions (future billing)
router.get("/subscriptions", SubscriptionControllers.getSubscriptions);
router.post(
  "/subscriptions",
  validateRequest(createSubscriptionValidation),
  SubscriptionControllers.createSubscription
);
router.patch(
  "/subscriptions/:id",
  validateRequest(updateSubscriptionValidation),
  SubscriptionControllers.updateSubscription
);
router.delete("/subscriptions/:id", SubscriptionControllers.softDeleteSubscription);

export const AdminRouters = router;

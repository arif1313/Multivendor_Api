import { Router } from "express";
import { upload } from "../../../uploads";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { ReviewControllers } from "../Review/Review.controller";
import { UserControllers } from "../User/User.controller";
import { registerVendorValidation } from "../User/User.validation";
import { VendorControllers } from "./Vendor.controller";
import { updateVendorValidation } from "./Vendor.validation";

const router = Router();

router.post(
  "/register",
  upload.single("logo"),
  validateRequest(registerVendorValidation),
  UserControllers.registerVendor
);

router.get("/me", auth("vendor"), VendorControllers.getMyShop);
router.patch(
  "/me",
  auth("vendor"),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  validateRequest(updateVendorValidation),
  VendorControllers.updateMyShop
);

router.get("/", VendorControllers.getPublicVendors);
router.get("/:id/reviews", ReviewControllers.getVendorReviews);
router.get("/:idOrSlug", VendorControllers.getVendorStorefront);

export const VendorRouters = router;

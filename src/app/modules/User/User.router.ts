import { Router } from "express";
import { upload } from "../../../uploads";
import { auth } from "../../middlewares/auth";
import { guestSession } from "../../middlewares/guestSession";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserControllers } from "./User.controller";
import {
  changePasswordValidation,
  loginValidation,
  refreshTokenValidation,
  registerCustomerValidation,
  updateUserValidation,
} from "./User.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(registerCustomerValidation),
  UserControllers.registerCustomer
);
router.post("/login", guestSession, validateRequest(loginValidation), UserControllers.login);
router.post(
  "/refresh-token",
  validateRequest(refreshTokenValidation),
  UserControllers.refreshToken
);
router.post(
  "/change-password",
  auth("admin", "vendor", "customer"),
  validateRequest(changePasswordValidation),
  UserControllers.changePassword
);
router.get("/me", auth("admin", "vendor", "customer"), UserControllers.getMe);
router.patch(
  "/me",
  auth("admin", "vendor", "customer"),
  upload.single("profileImage"),
  validateRequest(updateUserValidation),
  UserControllers.updateMe
);

export const AuthRouters = router;

import { Router } from "express";
import { upload } from "../../../uploads";
import { auth } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { CategoryControllers } from "./Category.controller";
import { createCategoryValidation, updateCategoryValidation } from "./Category.validation";

const router = Router();

router.get("/", CategoryControllers.getCategories);
router.get("/:id", CategoryControllers.getCategoryById);

router.post(
  "/",
  auth("admin"),
  upload.single("image"),
  validateRequest(createCategoryValidation),
  CategoryControllers.createCategory
);
router.patch(
  "/:id",
  auth("admin"),
  upload.single("image"),
  validateRequest(updateCategoryValidation),
  CategoryControllers.updateCategory
);
router.delete("/:id", auth("admin"), CategoryControllers.softDeleteCategory);

export const CategoryRouters = router;

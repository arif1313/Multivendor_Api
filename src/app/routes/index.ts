import { Router } from "express";
import { AdminRouters } from "../modules/Admin/Admin.router";
import { CartRouters } from "../modules/Cart/Cart.router";
import { CategoryRouters } from "../modules/Category/Category.router";
import { OrderRouters } from "../modules/Order/Order.router";
import { ProductRouters } from "../modules/Product/Product.router";
import { ReviewRouters } from "../modules/Review/Review.router";
import { AuthRouters } from "../modules/User/User.router";
import { VendorRouters } from "../modules/Vendor/Vendor.router";
import { VendorDashboardRouters } from "./vendorDashboard.router";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRouters },
  { path: "/vendors", route: VendorRouters },
  { path: "/vendor", route: VendorDashboardRouters },
  { path: "/categories", route: CategoryRouters },
  { path: "/products", route: ProductRouters },
  { path: "/cart", route: CartRouters },
  { path: "/orders", route: OrderRouters },
  { path: "/reviews", route: ReviewRouters },
  { path: "/admin", route: AdminRouters },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export const AppRouters = router;

import { Router } from "express";
import { optionalAuth } from "../../middlewares/auth";
import { guestSession } from "../../middlewares/guestSession";
import { validateRequest } from "../../middlewares/validateRequest";
import { OrderControllers } from "./Order.controller";
import { createOrderValidation } from "./Order.validation";

const router = Router();

// Checkout is open to guests as well as logged in customers.
router.use(optionalAuth, guestSession);

router.post("/", validateRequest(createOrderValidation), OrderControllers.createOrder);
router.get("/my-orders", OrderControllers.getMyOrders);
router.get("/:id", OrderControllers.getOrderById);

export const OrderRouters = router;

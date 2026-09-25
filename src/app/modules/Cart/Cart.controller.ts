import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { CartServices, TCartOwner } from "./Cart.service";

/** Logged in customers own a persistent cart, everyone else uses the guest id. */
export const resolveCartOwner = (req: Request): TCartOwner =>
  req.user?.role === "customer" ? { customerId: req.user.userId } : { guestId: req.guestId };

const getCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.getCartSummary(resolveCartOwner(req));
  sendResponse(res, { message: "Cart retrieved", data: result });
});

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.addToCart(
    resolveCartOwner(req),
    req.body.productId,
    req.body.quantity ?? 1
  );
  sendResponse(res, { statusCode: 201, message: "Product added to cart", data: result });
});

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.updateCartItem(
    resolveCartOwner(req),
    req.body.productId,
    req.body.quantity
  );
  sendResponse(res, { message: "Cart updated", data: result });
});

const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.removeCartItem(resolveCartOwner(req), req.params.productId);
  sendResponse(res, { message: "Product removed from cart", data: result });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const result = await CartServices.clearCart(resolveCartOwner(req));
  sendResponse(res, { message: "Cart cleared", data: result });
});

export const CartControllers = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
};

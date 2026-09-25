import Joi from "joi";

const customerInfoValidation = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  phone: Joi.string().pattern(/^[0-9+\-\s]{6,20}$/).required(),
  email: Joi.string().email().optional(),
  address: Joi.string().min(5).max(500).required(),
  city: Joi.string().max(80).optional(),
  note: Joi.string().max(500).optional(),
});

export const createOrderValidation = Joi.object({
  // "buy now" flow: send productId + quantity. Cart flow: leave both empty.
  productId: Joi.string().hex().length(24).optional(),
  quantity: Joi.number().integer().min(1).default(1),
  customerInfo: customerInfoValidation.required(),
  // Only cod is processed today, the bkash values are accepted by the schema for later.
  paymentMethod: Joi.string().valid("cod", "bkash_full", "bkash_delivery_only").default("cod"),
  guestId: Joi.string().optional(),
});

export const updateOrderStatusValidation = Joi.object({
  orderStatus: Joi.string()
    .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
    .required(),
  cancelReason: Joi.string().max(300).optional(),
});

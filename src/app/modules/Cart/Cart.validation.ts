import Joi from "joi";

export const addToCartValidation = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
  guestId: Joi.string().optional(),
});

export const updateCartValidation = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(0).required(),
  guestId: Joi.string().optional(),
});

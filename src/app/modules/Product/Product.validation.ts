import Joi from "joi";

export const createProductValidation = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  description: Joi.string().max(5000).optional(),
  price: Joi.number().min(0).required(),
  discountPrice: Joi.number().min(0).optional(),
  stock: Joi.number().integer().min(0).default(0),
  categoryId: Joi.string().hex().length(24).optional(),
  brand: Joi.string().max(80).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  paymentOptions: Joi.string().valid("cod", "bkash", "both").default("cod"),
  deliveryCharge: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateProductValidation = Joi.object({
  name: Joi.string().min(2).max(150),
  description: Joi.string().max(5000),
  price: Joi.number().min(0),
  discountPrice: Joi.number().min(0),
  stock: Joi.number().integer().min(0),
  categoryId: Joi.string().hex().length(24),
  brand: Joi.string().max(80),
  images: Joi.array().items(Joi.string()),
  paymentOptions: Joi.string().valid("cod", "bkash", "both"),
  deliveryCharge: Joi.number().min(0),
  isActive: Joi.boolean(),
});

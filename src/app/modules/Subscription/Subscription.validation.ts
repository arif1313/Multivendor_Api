import Joi from "joi";

export const createSubscriptionValidation = Joi.object({
  vendorId: Joi.string().hex().length(24).required(),
  planType: Joi.string().valid("monthly", "yearly", "per_product").required(),
  amount: Joi.number().min(0).required(),
  productLimit: Joi.number().integer().min(1).optional(),
  startDate: Joi.date().default(() => new Date()),
  expiryDate: Joi.date().required(),
  status: Joi.string().valid("active", "expired", "cancelled", "pending").default("pending"),
});

export const updateSubscriptionValidation = Joi.object({
  planType: Joi.string().valid("monthly", "yearly", "per_product"),
  amount: Joi.number().min(0),
  productLimit: Joi.number().integer().min(1),
  startDate: Joi.date(),
  expiryDate: Joi.date(),
  status: Joi.string().valid("active", "expired", "cancelled", "pending"),
});

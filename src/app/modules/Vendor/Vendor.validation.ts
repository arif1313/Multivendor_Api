import Joi from "joi";

export const updateVendorValidation = Joi.object({
  shopName: Joi.string().min(2).max(80),
  brandName: Joi.string().max(80),
  description: Joi.string().max(1000),
  address: Joi.string().max(255),
  contactNumber: Joi.string().pattern(/^[0-9+\-\s]{6,20}$/),
  logo: Joi.string(),
  banner: Joi.string(),
});

export const blockVendorValidation = Joi.object({
  isBlocked: Joi.boolean().required(),
});

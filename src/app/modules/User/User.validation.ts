import Joi from "joi";

export const registerCustomerValidation = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  contactNumber: Joi.string().pattern(/^[0-9+\-\s]{6,20}$/).optional(),
  address: Joi.string().max(255).optional(),
});

export const registerVendorValidation = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  contactNumber: Joi.string().pattern(/^[0-9+\-\s]{6,20}$/).optional(),
  shopName: Joi.string().min(2).max(80).required(),
  brandName: Joi.string().max(80).optional(),
  description: Joi.string().max(1000).optional(),
  address: Joi.string().max(255).optional(),
  logo: Joi.string().optional(),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  guestId: Joi.string().optional(),
});

export const refreshTokenValidation = Joi.object({
  refreshToken: Joi.string().required(),
});

export const changePasswordValidation = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(50).required(),
});

export const updateUserValidation = Joi.object({
  name: Joi.string().min(2).max(60),
  contactNumber: Joi.string().pattern(/^[0-9+\-\s]{6,20}$/),
  address: Joi.string().max(255),
  profileImage: Joi.string(),
});

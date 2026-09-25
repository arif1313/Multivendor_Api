import Joi from "joi";

export const createCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  image: Joi.string().optional(),
});

export const updateCategoryValidation = Joi.object({
  name: Joi.string().min(2).max(60),
  image: Joi.string(),
});

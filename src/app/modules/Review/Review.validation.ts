import Joi from "joi";

export const createReviewValidation = Joi.object({
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().max(1000).optional(),
  reviewerName: Joi.string().min(2).max(60).optional(),
  guestId: Joi.string().optional(),
});

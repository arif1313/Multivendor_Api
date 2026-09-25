import { NextFunction, Request, Response } from "express";
import { ObjectSchema } from "joi";
import { AppError } from "../utils/AppError";

/** Removes empty strings/null so multipart form fields do not fail validation. */
const cleanBody = (body: Record<string, unknown>): Record<string, unknown> => {
  const cleaned: Record<string, unknown> = {};
  Object.entries(body || {}).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) cleaned[key] = value;
  });
  return cleaned;
};

export const validateRequest = (schema: ObjectSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(cleanBody(req.body), { abortEarly: false });
    if (error) {
      return next(new AppError(400, error.details.map((d) => d.message).join(", ")));
    }
    req.body = value;
    next();
  };
};

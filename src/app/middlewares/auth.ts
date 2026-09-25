import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "../../config";
import { AppError } from "../utils/AppError";
import { UserModel } from "../modules/User/User.model";
import { TUserRole } from "../modules/User/User.interface";

export type TAuthPayload = {
  userId: string;
  email: string;
  role: TUserRole;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TAuthPayload;
    }
  }
}

const extractToken = (req: Request): string | undefined => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return header || undefined;
};

export const verifyToken = (token: string): TAuthPayload => {
  const decoded = jwt.verify(token, config.jwt.accessSecret) as JwtPayload & TAuthPayload;
  return { userId: decoded.userId, email: decoded.email, role: decoded.role };
};

export const auth = (...roles: TUserRole[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      if (!token) throw new AppError(401, "You are not authorized");

      const decoded = verifyToken(token);

      const user = await UserModel.findById(decoded.userId);
      if (!user || user.isDeleted) throw new AppError(401, "User no longer exists");
      if (user.isBlocked) throw new AppError(403, "Your account is blocked");

      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(403, "You do not have permission to perform this action");
      }

      req.user = { userId: String(user._id), email: user.email, role: user.role };
      next();
    } catch (err) {
      next(err instanceof AppError ? err : new AppError(401, "Invalid or expired token"));
    }
  };
};

/** Attaches req.user when a valid token exists, but never rejects the request. */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded.userId);
    if (user && !user.isDeleted && !user.isBlocked) {
      req.user = { userId: String(user._id), email: user.email, role: user.role };
    }
  } catch {
    // ignore invalid token for public routes
  }
  next();
};

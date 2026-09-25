import crypto from "crypto";
import { NextFunction, Request, Response } from "express";

export const GUEST_COOKIE = "guestId";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      guestId?: string;
    }
  }
}

/**
 * Resolves a stable guest identifier from cookie, `x-guest-id` header or body,
 * so an anonymous visitor can keep a cart without logging in.
 */
export const guestSession = (req: Request, res: Response, next: NextFunction) => {
  const existing =
    (req.cookies?.[GUEST_COOKIE] as string | undefined) ||
    (req.headers["x-guest-id"] as string | undefined) ||
    (req.body?.guestId as string | undefined) ||
    (req.query?.guestId as string | undefined);

  const guestId = existing || crypto.randomUUID();
  req.guestId = guestId;

  if (!existing) {
    res.cookie(GUEST_COOKIE, guestId, {
      httpOnly: false,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: "lax",
    });
  }
  res.setHeader("x-guest-id", guestId);
  next();
};

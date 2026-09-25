import { Response } from "express";

export type TMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type TResponse<T> = {
  statusCode?: number;
  success?: boolean;
  message: string;
  meta?: TMeta;
  data?: T;
};

export const sendResponse = <T>(res: Response, payload: TResponse<T>) => {
  const statusCode = payload.statusCode ?? 200;
  return res.status(statusCode).json({
    success: payload.success ?? true,
    message: payload.message,
    meta: payload.meta,
    data: payload.data,
  });
};

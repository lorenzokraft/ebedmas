import { Request, Response, NextFunction } from 'express';

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface TypedResponse<T> extends Response {
  json: (body: T) => TypedResponse<T>;
}

export type AsyncRequestHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;

export interface UserRequest extends Request {
  user?: {
    id: number;
    email: string;
    role?: string;
  };
} 
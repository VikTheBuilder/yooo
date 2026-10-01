import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid token' });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string);
    if (typeof payload === 'string' || !Number.isSafeInteger(payload.userId) || payload.userId <= 0) {
      res.status(401).json({ error: 'Token expired or invalid' });
      return;
    }
    req.userId = payload.userId as number;
    next();
  } catch {
    res.status(401).json({ error: 'Token expired or invalid' });
  }
}

export function optionalAuthenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.headers.authorization) {
    next();
    return;
  }
  authenticate(req, res, next);
}

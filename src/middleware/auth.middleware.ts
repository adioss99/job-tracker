/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-namespace */
import { Request, Response, NextFunction } from 'express';
import { verifyAcessToken, verifyRefreshToken } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const userPayload = verifyAcessToken(token);
  if (!userPayload) {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
  req.user = userPayload;
  next();
};

export const verifyRToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.refresh;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No refresh token provided' });
  }
  const userPayload = verifyRefreshToken(token);
  if (!userPayload) {
    return res.status(401).json({ success: false, message: 'Token invalid' });
  }
  req.user = userPayload;
  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  next();
};

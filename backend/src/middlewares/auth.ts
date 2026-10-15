import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/token';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }

  req.user = decoded;
  next();
};

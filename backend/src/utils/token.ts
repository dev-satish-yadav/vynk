import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'vynk_secret_key_default_development';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): TokenPayload | null => {
  if (!token || typeof token !== 'string' || token === 'undefined' || token === 'null' || !token.trim()) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded) return null;

    const userId = decoded.userId || decoded.id || decoded.sub;
    if (!userId) return null;

    return {
      userId,
      email: decoded.email || '',
      username: decoded.username || '',
    };
  } catch (err) {
    return null;
  }
};

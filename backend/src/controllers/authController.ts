import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';
import { User } from '../models';
import { generateToken } from '../utils/token';
import { AuthRequest } from '../middlewares/auth';

export class AuthController {
  /**
   * User Registration
   */
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, avatarUrl, about } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Username, email, and password are required.' });
      }

      // Check existing user
      const existing = await User.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });

      if (existing) {
        return res.status(409).json({ success: false, message: 'Username or email already in use.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        username,
        email,
        passwordHash,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        about: about || 'Hey there! I am using Vynk.',
        isOnline: true,
        lastSeen: new Date(),
      });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            about: user.about,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
          },
          token,
        },
      });
    } catch (err: any) {
      console.error('[AuthController.register]', err);
      return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
    }
  }

  /**
   * User Login
   */
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      const userLookup = username || req.body.loginIdentifier;

      if (!userLookup || !password) {
        return res.status(400).json({ success: false, message: 'Please provide username and password.' });
      }

      const user = await User.findOne({
        where: {
          [Op.or]: [{ email: userLookup }, { username: userLookup }],
        },
      });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const passwordHash = user.getDataValue('passwordHash') || user.passwordHash || (user as any).password_hash;
      if (!passwordHash) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      const isMatch = await bcrypt.compare(password, passwordHash);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials.' });
      }

      // Mark online
      await user.update({ isOnline: true, lastSeen: new Date() });

      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      return res.json({
        success: true,
        message: 'Logged in successfully.',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            about: user.about,
            isOnline: true,
            lastSeen: user.lastSeen,
          },
          token,
        },
      });
    } catch (err: any) {
      console.error('[AuthController.login]', err);
      return res.status(500).json({ success: false, message: err.message || 'Login failed' });
    }
  }

  /**
   * Get Current Authenticated User Profile
   */
  static async getMe(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'avatarUrl', 'about', 'isOnline', 'lastSeen'],
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      return res.json({ success: true, data: { user } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Search Users to Start New Chat
   */
  static async searchUsers(req: AuthRequest, res: Response) {
    try {
      const currentUserId = req.user?.userId;
      const query = (req.query.q as string) || '';

      const whereClause: any = {
        id: { [Op.ne]: currentUserId },
      };

      if (query.trim()) {
        whereClause[Op.or] = [
          { username: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
        ];
      }

      const users = await User.findAll({
        where: whereClause,
        attributes: ['id', 'username', 'email', 'avatarUrl', 'about', 'isOnline', 'lastSeen'],
        limit: 20,
      });

      return res.json({ success: true, data: { users } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Update Profile
   */
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { about, avatarUrl } = req.body;

      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      await user.update({
        ...(about !== undefined && { about }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      });

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            avatarUrl: user.avatarUrl,
            about: user.about,
            isOnline: user.isOnline,
            lastSeen: user.lastSeen,
          },
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Logout User (sets isOnline to false and updates lastSeen)
   */
  static async logout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (userId) {
        await User.update({ isOnline: false, lastSeen: new Date() }, { where: { id: userId } });
      }
      return res.json({ success: true, message: 'Logged out successfully' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

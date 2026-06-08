import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/supabase';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify custom JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_fresherx_change_me';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Attach user payload to the request
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      
      next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};

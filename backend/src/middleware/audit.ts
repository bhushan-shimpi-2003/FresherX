import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const auditMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only log state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', async () => {
      try {
        // Skip some high volume or noisy routes if needed
        if (req.path.includes('/views') || req.path.includes('/notifications')) return;

        const userId = (req as any).user?.id || null;
        let action = `${req.method} ${req.baseUrl || ''}${req.path}`;
        
        await supabaseAdmin.from('audit_logs').insert({
          user_id: userId,
          action: action,
          details: {
            ip: req.ip,
            status: res.statusCode,
            query: req.query,
          }
        });
      } catch (err) {
        console.error('Audit log error:', err);
      }
    });
  }
  next();
};

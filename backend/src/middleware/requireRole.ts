import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

/**
 * Middleware de autorización por rol.
 * Debe usarse DESPUÉS de `authenticateJWT`.
 * @example router.post('/professionals', authenticateJWT, requireRole('ADMIN'), createProfessional);
 */
export const requireRole = (...roles: (string | string[])[]) => {
  const allowedRoles = roles.flat();
  return (req: AuthRequest, res: Response, next: NextFunction): any => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No tenés permisos para realizar esta acción' });
    }
    next();
  };
};

import { Request, Response, NextFunction } from 'express';

/**
 * Authorize middleware
 * resticts access to certain roles.
 * Admin bypasses all checks and has universal access.
 * 
 * @param roles Roles permitted to access the endpoint
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. User session not found.',
      });
      return;
    }

    // Admin always gets access
    if (req.user.role === 'Admin') {
      return next();
    }

    if (roles.includes(req.user.role)) {
      return next();
    }

    res.status(403).json({
      success: false,
      message: `Forbidden. Role '${req.user.role}' is not authorized to perform this action.`,
    });
  };
};

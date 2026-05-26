import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate presence of required fields in request body.
 * Returns 400 Bad Request if any fields are missing.
 * 
 * @param fields Array of field names required in request body
 */
export const validateRequiredFields = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const missingFields: string[] = [];
    
    for (const field of fields) {
      if (
        req.body[field] === undefined ||
        req.body[field] === null ||
        (typeof req.body[field] === 'string' && req.body[field].trim() === '')
      ) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missing: missingFields,
      });
      return;
    }
    
    next();
  };
};

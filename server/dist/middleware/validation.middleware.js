"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequiredFields = void 0;
/**
 * Middleware to validate presence of required fields in request body.
 * Returns 400 Bad Request if any fields are missing.
 *
 * @param fields Array of field names required in request body
 */
const validateRequiredFields = (fields) => {
    return (req, res, next) => {
        const missingFields = [];
        for (const field of fields) {
            if (req.body[field] === undefined ||
                req.body[field] === null ||
                (typeof req.body[field] === 'string' && req.body[field].trim() === '')) {
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
exports.validateRequiredFields = validateRequiredFields;

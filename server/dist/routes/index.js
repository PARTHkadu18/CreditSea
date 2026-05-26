"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const borrower_routes_1 = __importDefault(require("./borrower.routes"));
const loan_routes_1 = __importDefault(require("./loan.routes"));
const ops_routes_1 = __importDefault(require("./ops.routes"));
const router = (0, express_1.Router)();
// Mount API sub-routers
router.use('/auth', auth_routes_1.default);
router.use('/borrower', borrower_routes_1.default);
router.use('/loans', loan_routes_1.default);
router.use('/ops', ops_routes_1.default);
// Health check endpoint
router.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'LMS Backend Server is healthy and running.',
        timestamp: new Date(),
    });
});
exports.default = router;

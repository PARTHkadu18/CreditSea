"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const loan_controller_1 = require("../controllers/loan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Live loan repayment calculator endpoint (can be consumed by any user or portal)
router.get('/calculate', loan_controller_1.calculateLoan);
// Retrieve detailed loan status transition history and recorded payments
router.get('/:loanId/history', auth_middleware_1.protect, loan_controller_1.getLoanHistory);
exports.default = router;

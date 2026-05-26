"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const borrower_controller_1 = require("../controllers/borrower.controller");
const loan_controller_1 = require("../controllers/loan.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Secure all routes in this file
router.use(auth_middleware_1.protect);
// Borrower profile routes
router.post('/profile', (0, rbac_middleware_1.authorize)('Borrower'), (0, validation_middleware_1.validateRequiredFields)(['fullName', 'pan', 'dob', 'monthlySalary', 'employmentMode']), borrower_controller_1.submitProfile);
router.get('/profile', (0, rbac_middleware_1.authorize)('Borrower', 'Admin'), borrower_controller_1.getProfile);
// Salary slip upload
router.post('/upload-salary-slip', (0, rbac_middleware_1.authorize)('Borrower'), upload_middleware_1.uploadSalarySlip.single('file'), borrower_controller_1.uploadSalarySlipController);
// Loan application routes
router.post('/apply-loan', (0, rbac_middleware_1.authorize)('Borrower'), (0, validation_middleware_1.validateRequiredFields)(['principal', 'tenure', 'salarySlipPath']), loan_controller_1.applyLoan);
router.get('/loans', (0, rbac_middleware_1.authorize)('Borrower', 'Admin'), loan_controller_1.getMyLoans);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rbac_middleware_1 = require("../middleware/rbac.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const ops_controller_1 = require("../controllers/ops.controller");
const router = (0, express_1.Router)();
// Secure all operations dashboard routes
router.use(auth_middleware_1.protect);
// 1. Sales Module
router.get('/sales', (0, rbac_middleware_1.authorize)('Sales'), ops_controller_1.getSalesData);
// 2. Sanction Module
router.get('/sanction', (0, rbac_middleware_1.authorize)('Sanction'), ops_controller_1.getSanctionData);
router.post('/sanction/:loanId', (0, rbac_middleware_1.authorize)('Sanction'), (0, validation_middleware_1.validateRequiredFields)(['action']), ops_controller_1.decideSanction);
// 3. Disbursement Module
router.get('/disbursement', (0, rbac_middleware_1.authorize)('Disbursement'), ops_controller_1.getDisbursementData);
router.post('/disbursement/:loanId/disburse', (0, rbac_middleware_1.authorize)('Disbursement'), ops_controller_1.disburseLoan);
// 4. Collection Module
router.get('/collection', (0, rbac_middleware_1.authorize)('Collection'), ops_controller_1.getCollectionData);
router.post('/collection/:loanId/payment', (0, rbac_middleware_1.authorize)('Collection'), (0, validation_middleware_1.validateRequiredFields)(['utr', 'amount']), ops_controller_1.recordPayment);
// 5. Admin General Overview
router.get('/admin/overview', (0, rbac_middleware_1.authorize)('Admin'), ops_controller_1.getAdminOverview);
exports.default = router;

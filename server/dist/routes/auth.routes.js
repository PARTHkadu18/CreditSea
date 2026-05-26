"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validation_middleware_1.validateRequiredFields)(['name', 'email', 'password']), auth_controller_1.register);
router.post('/login', (0, validation_middleware_1.validateRequiredFields)(['email', 'password']), auth_controller_1.login);
// Protected routes
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
exports.default = router;

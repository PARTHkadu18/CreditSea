"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../models/user.model");
const borrower_model_1 = require("../models/borrower.model");
const loan_model_1 = require("../models/loan.model");
const payment_model_1 = require("../models/payment.model");
const history_model_1 = require("../models/history.model");
const document_model_1 = require("../models/document.model");
const config_1 = require("../config/config");
const seedUsers = [
    {
        name: 'System Administrator',
        email: 'admin@creditsea.com',
        password: 'Admin@123',
        role: 'Admin',
    },
    {
        name: 'Sales Executive',
        email: 'sales@creditsea.com',
        password: 'Sales@123',
        role: 'Sales',
    },
    {
        name: 'Sanction Executive',
        email: 'sanction@creditsea.com',
        password: 'Sanction@123',
        role: 'Sanction',
    },
    {
        name: 'Disbursement Executive',
        email: 'disburse@creditsea.com',
        password: 'Disburse@123',
        role: 'Disbursement',
    },
    {
        name: 'Collection Executive',
        email: 'collect@creditsea.com',
        password: 'Collect@123',
        role: 'Collection',
    },
    {
        name: 'Sample Borrower',
        email: 'borrower@creditsea.com',
        password: 'Borrower@123',
        role: 'Borrower',
    },
];
const seedDatabase = async () => {
    try {
        console.log('Connecting to MongoDB for seeding...');
        await mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('Connected successfully. Purging existing database collections for a fresh start...');
        // Delete existing records to avoid conflicts and start clean
        await user_model_1.User.deleteMany({});
        await borrower_model_1.BorrowerProfile.deleteMany({});
        await loan_model_1.Loan.deleteMany({});
        await payment_model_1.Payment.deleteMany({});
        await history_model_1.LoanStatusHistory.deleteMany({});
        await document_model_1.DocumentModel.deleteMany({});
        console.log('Wiped collections. Seeding seed users...');
        // Create users
        // password hashing is done automatically by User model pre-save hook
        for (const u of seedUsers) {
            const user = await user_model_1.User.create(u);
            console.log(`Successfully created account -> Role: ${user.role} | Email: ${user.email} | Password: ${u.password}`);
        }
        console.log('\n======================================================');
        console.log('Database seeding successfully completed!');
        console.log('Use the above credentials to test the loan portal flows.');
        console.log('======================================================\n');
        await mongoose_1.default.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
    catch (error) {
        console.error('Error occurred while seeding database:', error);
        process.exit(1);
    }
};
// Run seed script
seedDatabase();

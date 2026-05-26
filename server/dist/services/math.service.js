"use strict";
/**
 * Math service for Loan financial calculations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLoanMath = void 0;
/**
 * Calculates Simple Interest and Total Repayment
 * Formula: SI = (P * R * T) / (365 * 100)
 *
 * @param principal Principal amount (P)
 * @param tenureInDays Tenure in days (T)
 * @param annualRate Annual interest rate percentage (R), default 12%
 */
const calculateLoanMath = (principal, tenureInDays, annualRate = 12) => {
    // Simple Interest formula
    const simpleInterest = (principal * annualRate * tenureInDays) / (365 * 100);
    // Format numbers to 2 decimal places for financial calculations
    const interest = Math.round(simpleInterest * 100) / 100;
    const totalRepayment = Math.round((principal + interest) * 100) / 100;
    return {
        principal,
        tenure: tenureInDays,
        rate: annualRate,
        interest,
        totalRepayment,
    };
};
exports.calculateLoanMath = calculateLoanMath;

"use strict";
/**
 * Business Rule Engine (BRE) Service
 * Evaluates borrower eligibility based on age, income, employment, and PAN format.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEligibility = exports.calculateAge = void 0;
const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
exports.calculateAge = calculateAge;
const checkEligibility = (details) => {
    const errors = [];
    // 1. Age check: between 23 and 50 (inclusive)
    const dobDate = new Date(details.dob);
    if (isNaN(dobDate.getTime())) {
        errors.push('Invalid Date of Birth format');
    }
    else {
        const age = (0, exports.calculateAge)(dobDate);
        if (age < 23 || age > 50) {
            errors.push(`Age must be between 23 and 50. Calculated age is ${age}.`);
        }
    }
    // 2. Monthly salary check: >= 25,000
    if (details.monthlySalary < 25000) {
        errors.push(`Monthly salary must be at least 25,000. Provided: ${details.monthlySalary}.`);
    }
    // 3. PAN Format check: matches regex [A-Z]{5}[0-9]{4}[A-Z]{1}
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const panUpper = details.pan.trim().toUpperCase();
    if (!panRegex.test(panUpper)) {
        errors.push('PAN number must match the valid format (e.g., ABCDE1234F).');
    }
    // 4. Employment mode check: cannot be Unemployed
    if (details.employmentMode === 'Unemployed') {
        errors.push('Employment mode cannot be Unemployed.');
    }
    else if (!['Salaried', 'Self-Employed'].includes(details.employmentMode)) {
        errors.push('Employment mode must be Salaried or Self-Employed.');
    }
    return {
        passed: errors.length === 0,
        errors,
    };
};
exports.checkEligibility = checkEligibility;

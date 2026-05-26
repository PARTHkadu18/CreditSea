/**
 * Formats a number as Indian Rupee (INR) currency.
 * 
 * @param amount Number to format
 */
export const formatCurrency = (amount: number): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0.00';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formats a Date object or string into a clean readable layout.
 * Example: May 26, 2026
 * 
 * @param dateVal Date object or date string
 */
export const formatDate = (dateVal: Date | string): string => {
  if (!dateVal) return 'N/A';
  
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'N/A';
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

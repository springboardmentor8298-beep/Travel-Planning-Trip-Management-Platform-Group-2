/**
 * Reusable Currency Formatter for Indian Rupee (₹) and other currencies
 * Formats numbers using the Indian numbering system (en-IN).
 * 
 * @param {number} amount - The numeric amount to format
 * @param {string} currency - The ISO currency code (default: 'INR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    amount = 0;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
};

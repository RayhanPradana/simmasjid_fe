/**
 * Format number to Indonesian Rupiah currency
 * @param {number} amount - The amount to be formatted
 * @returns {string} - Formatted rupiah
 */
export const formatRupiah = (amount) => {
  if (amount === null || amount === undefined) return "Rp 0";
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format date to Indonesian locale string
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Format date to database format (YYYY-MM-DD)
 * @param {Date|string} date - The date to format
 * @returns {string} - Formatted date (YYYY-MM-DD)
 */
export const formatDateForDb = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
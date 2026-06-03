/**
 * Format large numbers with K/M/B suffixes
 * Examples: 1000 -> 1K, 1500 -> 1.5K, 1000000 -> 1M
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  
  const number = Number(num);
  
  if (number < 1000) return number.toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixNum = Math.floor(Math.log10(number) / 3);
  
  if (suffixNum >= suffixes.length) return number.toExponential(2);
  
  const shortValue = number / Math.pow(1000, suffixNum);
  const formatted = shortValue.toFixed(shortValue % 1 === 0 ? 0 : 1);
  
  return formatted + suffixes[suffixNum];
};

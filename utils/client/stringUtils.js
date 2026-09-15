/**
 * String manipulation utilities
 */

/**
 * Truncate a string to a maximum length and append ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @param {number} truncateAt - Position to truncate at (defaults to maxLength - 2)
 * @returns {string} Truncated string with ellipsis if needed
 */
export const truncateLabel = (
  text,
  maxLength = 17,
  truncateAt = maxLength - 2,
) => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return `${text.substring(0, truncateAt)}...`;
};

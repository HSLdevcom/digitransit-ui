/**
 * Generate aria-live messages for react-select dropdowns.
 * @param {Object} intl - Internationalization object (react-intl v2)
 * @returns {Object} Aria message configuration object
 */
export const getAriaMessages = intl => ({
  guidance: () => '.', // react-select requires non-empty string for aria-live regions
  onChange: ({ value }) =>
    `${intl.formatMessage({ id: 'route-page.pattern-chosen' })} ${value.label}`,
  onFilter: () => '',
  onFocus: ({ context: itemContext, focused }) => {
    if (itemContext === 'menu') {
      return focused.label;
    }
    return '';
  },
});

/**
 * Calculate class name prefix based on alignment and id
 * @param {boolean} alignRight - Whether to align right
 * @param {string} id - Component id
 * @returns {string} Class name prefix for react-select
 */
export const getClassNamePrefix = (alignRight, id) => {
  if (!alignRight) {
    return 'dd';
  }
  return id === 'other-dates' ? 'dd-timerange' : 'dd-right';
};

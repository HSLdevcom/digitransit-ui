import PropTypes from 'prop-types';

export const mockContext = {
  getStore: () => ({
    on: () => {},
    getLanguage: () => 'en',
  }),
};

export const mockChildContextTypes = {
  getStore: PropTypes.func,
};

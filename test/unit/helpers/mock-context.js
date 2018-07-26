import PropTypes from 'prop-types';

export const mockContext = {
  getStore: () => ({
    on: () => {},
    getLanguage: () => 'en',
    getMessages: () => [],
  }),
};

export const mockChildContextTypes = {
  getStore: PropTypes.func,
};

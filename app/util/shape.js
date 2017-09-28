/* eslint-disable import/prefer-default-export */

import PropTypes from 'prop-types';

export const routerShape = PropTypes.shape({
  replace: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
});

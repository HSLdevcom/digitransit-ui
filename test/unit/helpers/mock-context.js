import PropTypes from 'prop-types';
import { locationShape, routerShape } from 'react-router';

import mockRouter from './mock-router';
import PositionStore from '../../../app/store/PositionStore';

const noop = () => {};

/**
 * The mockContext can be used as a starting point for building a useful
 * context for testing different types of React components and fulfilling
 * their propType requirements.
 */
export const mockContext = {
  config: {},
  executeAction: noop,
  getStore: () => ({
    on: noop,
    getLanguage: () => 'en',
    getLocationState: () => ({
      lat: '',
      lon: '',
      address: '',
      status: PositionStore.STATUS_NO_LOCATION,
      hasLocation: false,
      isLocationingInProgress: false,
      locationingFailed: false,
    }),
    getMessages: () => [],
    removeListener: noop,
  }),
  location: {
    action: '',
    pathname: '',
    search: '',
  },
  router: mockRouter,
};

/**
 * The mockChildContextTypes reflects the contents of mockContext.
 */
export const mockChildContextTypes = {
  config: PropTypes.object,
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
  location: locationShape,
  router: routerShape,
};

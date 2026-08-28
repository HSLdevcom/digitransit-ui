import { DateTime } from 'luxon';
import PropTypes from 'prop-types';
import { matchShape, routerShape } from 'found';

import { mockRouter, mockMatch } from './mock-router';
import PositionStore from '../../../app/store/PositionStore';
import config from '../../../app/configurations/config.default';

const noop = () => {};

/**
 * The mockContext can be used as a starting point for building a useful
 * context for testing different types of React components and fulfilling
 * their propType requirements.
 */
export const mockContext = {
  config: { ...config, language: config.defaultLanguage || 'en' },
  executeAction: noop,
  getStore: () => ({
    on: noop,
    getCurrentTime: () => DateTime.now(),
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
    getDuplicateMessageCounter: () => 0,
    removeListener: noop,
    getRoutingSettings: () => ({}),
    isFavourite: noop,
    getStatus: () => 'ready',
    getUser: () => ({}),
    storeFavourites: noop,
  }),
  match: mockMatch,
  router: mockRouter,
};

/**
 * The mockChildContextTypes reflects the contents of mockContext.
 */
export const mockChildContextTypes = {
  config: PropTypes.object,
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
  router: routerShape,
  match: matchShape,
};

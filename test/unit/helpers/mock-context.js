import { getMuiTheme } from 'material-ui/styles';
import moment from 'moment';
import PropTypes from 'prop-types';
import { matchShape, routerShape } from 'found';

import { mockRouter, mockMatch } from './mock-router';
import PositionStore from '../../../app/store/PositionStore';

const noop = () => {};
const muiTheme = getMuiTheme({
  userAgent: 'foo',
});

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
    getCurrentTime: () => moment(),
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
    getRoutingSettings: () => ({}),
  }),
  match: mockMatch,
  muiTheme,
  router: mockRouter,
};

/**
 * The mockChildContextTypes reflects the contents of mockContext.
 */
export const mockChildContextTypes = {
  config: PropTypes.object,
  executeAction: PropTypes.func,
  getStore: PropTypes.func,
  muiTheme: PropTypes.object,
  router: routerShape,
  match: matchShape,
};

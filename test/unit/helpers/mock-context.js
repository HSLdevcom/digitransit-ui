import PropTypes from 'prop-types';
import PositionStore from '../../../app/store/PositionStore';

const noop = () => {};

export const mockContext = {
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
    removeListener: noop,
  }),
};

export const mockChildContextTypes = {
  getStore: PropTypes.func,
};

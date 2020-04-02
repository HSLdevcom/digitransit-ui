import { expect } from 'chai';
import { describe, it } from 'mocha';

import PositionStore from '../../../app/store/PositionStore';

describe('PositionStore', () => {
  describe('startReverseGeocoding', () => {
    it('should set reverse geocoding status to in progress', () => {
      const store = new PositionStore();
      store.reverseGeocodingStatus =
        PositionStore.REVERSE_GEOCODING_STATUS_READY;
      store.startReverseGeocoding();
      const state = store.getLocationState();
      expect(state.isReverseGeocodingInProgress === true);
    });
  });

  describe('storeAddress', () => {
    it('should set reverse geocoding status to not in progress', () => {
      const store = new PositionStore();
      store.reverseGeocodingStatus =
        PositionStore.REVERSE_GEOCODING_STATUS_IN_PROGRESS;
      store.storeAddress({ address: 'test' });
      const state = store.getLocationState();
      expect(state.isReverseGeocodingInProgress === false);
    });
  });

  describe('storeLocation', () => {
    it('should not change reverse geolocation status', () => {
      const store = new PositionStore();
      store.reverseGeocodingStatus =
        PositionStore.REVERSE_GEOCODING_STATUS_IN_PROGRESS;
      store.storeLocation({});
      let state = store.getLocationState();
      expect(state.isReverseGeocodingInProgress === true);

      store.reverseGeocodingStatus =
        PositionStore.REVERSE_GEOCODING_STATUS_READY;
      store.storeLocation({});
      state = store.getLocationState();
      expect(state.isReverseGeocodingInProgress === false);
    });
  });
});

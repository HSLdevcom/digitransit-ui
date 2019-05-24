import React from 'react';

import { shallowWithIntl, mountWithIntl } from '../../helpers/mock-intl-enzyme';
import IconMarker from '../../../../app/component/map/IconMarker';
import {
  Component as VehicleMarkerContainer,
  shouldShowVehicle,
  getVehicleIcon,
} from '../../../../app/component/map/VehicleMarkerContainer';

const defaultProps = {
  direction: 0,
  pattern: 'tampere:2:0:02',
  headsign: 'Pyynikintori',
  tripStart: undefined,
  vehicles: {
    tampereBus: {
      direction: 0,
      heading: 180,
      headsign: 'Pyynikintori',
      id: 'tampereBus',
      lat: 61.50639,
      long: 23.77416,
      mode: 'bus',
      next_stop: undefined,
      operationDay: '20190322',
      route: 'tampere:2',
      timestamp: 1553260781,
      tripStartTime: '1514',
    },
  },
};

describe('<VehicleMarkerContainer />', () => {
  describe('VehicleMarkerContainer', () => {
    it('should render', () => {
      const wrapper = shallowWithIntl(
        <VehicleMarkerContainer {...defaultProps} />,
      );
      expect(wrapper.isEmptyRender()).to.equal(false);
    });
  });

  describe('shouldShowVehicle', () => {
    it('should return false when lat is missing', () => {
      const message = {
        long: 23.77416,
        route: 'tampere:2',
      };

      const shouldShow = shouldShowVehicle(
        message,
        undefined,
        undefined,
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).to.equal(false);
    });

    it('should return false when long is missing', () => {
      const message = {
        lat: 61.50639,
        route: 'tampere:2',
      };

      const shouldShow = shouldShowVehicle(
        message,
        undefined,
        undefined,
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).to.equal(false);
    });

    it('should return false when route doesnt match', () => {
      const message = {
        lat: 61.50639,
        long: 23.77416,
        route: 'tampere:3',
      };

      const shouldShow = shouldShowVehicle(
        message,
        undefined,
        undefined,
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).to.equal(false);
    });

    it('should return true when lat, long and route exist/match', () => {
      const message = {
        lat: 61.50639,
        long: 23.77416,
        route: 'tampere:2',
      };

      const shouldShow = shouldShowVehicle(
        message,
        undefined,
        undefined,
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).to.equal(true);
    });

    it('should return false when headsign does not match', () => {
      const message = {
        lat: 61.50639,
        long: 23.77416,
        route: 'tampere:2',
        direction: 0,
        tripStartTime: '1514',
        headsign: 'Tampere',
      };

      const shouldShow = shouldShowVehicle(
        message,
        0,
        '1514',
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).to.equal(false);
    });

    it('should return false when direction does not match', () => {
      const message = {
        lat: 61.50639,
        long: 23.77416,
        route: 'tampere:2',
        direction: 1,
        tripStartTime: '1514',
        headsign: 'Pyynikintori',
      };

      const shouldShow = shouldShowVehicle(
        message,
        2,
        '1514',
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).to.equal(false);
    });

    it('should return false when tripStartTime does not match', () => {
      const message = {
        lat: 61.50639,
        long: 23.77416,
        route: 'tampere:2',
        direction: 1,
        tripStartTime: '1650',
        headsign: 'Pyynikintori',
      };

      const shouldShow = shouldShowVehicle(
        message,
        2,
        '1514',
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).to.equal(false);
    });

    it('should return true when headsign, direction and tripStartTime match', () => {
      const message = {
        lat: 61.50639,
        long: 23.77416,
        route: 'tampere:2',
        direction: 0,
        tripStartTime: '1514',
        headsign: 'Pyynikintori',
      };

      const shouldShow = shouldShowVehicle(
        message,
        0,
        '1514',
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).to.equal(true);
    });
  });

  describe('getVehicleIcon', () => {
    it('should use an appropriate icon for the given mode', () => {
      const icon = getVehicleIcon('subway', 180);
      const wrapper = mountWithIntl(icon.element);
      expect(wrapper.prop('img')).to.equal('icon-icon_subway-live');
      expect(icon.className).to.contain('subway');
    });

    it('should use a bus icon for an unknown mode', () => {
      const icon = getVehicleIcon('foobar', 180);
      const wrapper = mountWithIntl(icon.element);
      expect(wrapper.prop('img')).to.equal('icon-icon_bus-live');
      expect(icon.className).to.contain('bus');
    });
  });
});

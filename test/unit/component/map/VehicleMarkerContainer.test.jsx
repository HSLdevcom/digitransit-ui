import React from 'react';
import { render } from '@testing-library/react';

import { LeafletProvider } from 'react-leaflet/es/context';

import { renderWithProviders } from '../../helpers/mock-providers';
import VehicleMarkerContainer, {
  shouldShowVehicle,
  getVehicleIcon,
} from '../../../../app/component/map/VehicleMarkerContainer';
import { mockContext } from '../../helpers/mock-context';
import events from '../../../../utils/client/events';

const defaultProps = {
  direction: 0,
  pattern: 'tampere:2:0:02',
  headsign: 'Pyynikintori',
  tripStart: undefined,
  mode: undefined,
};

const vehicles = {
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
};

describe('<VehicleMarkerContainer />', () => {
  describe('VehicleMarkerContainer', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should render', () => {
      const addLayer = vi.fn();
      renderWithProviders(
        <LeafletProvider
          value={{ layerContainer: { addLayer, removeLayer: () => {} } }}
        >
          <VehicleMarkerContainer {...defaultProps} />
        </LeafletProvider>,
        {
          config: {
            ...mockContext.config,
            realTime: {
              tampere: {},
            },
          },
          vehicles,
        },
      );
      expect(addLayer.mock.calls.length).toBe(1);
    });

    it.each([
      [0, 1],
      [1, 0],
      [undefined, 0],
      [undefined, 1],
    ])(
      'filters vehicles for direction prop %s and topic direction %i',
      (direction, topicDirection) => {
        const addLayer = vi.fn();
        const emit = vi.spyOn(events, 'emit');
        renderWithProviders(
          <LeafletProvider
            value={{ layerContainer: { addLayer, removeLayer: () => {} } }}
          >
            <VehicleMarkerContainer
              {...defaultProps}
              direction={direction}
              topics={[{ route: '2', direction: topicDirection }]}
            />
          </LeafletProvider>,
          {
            config: {
              ...mockContext.config,
              realTime: {
                tampere: {},
              },
            },
            vehicles: {
              ...vehicles,
              reverseBus: {
                ...vehicles.tampereBus,
                id: 'reverseBus',
                direction: 1,
              },
            },
          },
        );

        expect(addLayer).toHaveBeenCalledTimes(1);
        expect(emit).toHaveBeenLastCalledWith('vehiclesChanged', [
          expect.objectContaining({
            id:
              (direction ?? topicDirection) === 0 ? 'tampereBus' : 'reverseBus',
            visible: true,
          }),
        ]);
      },
    );
    it('shows only the vehicle of the topic trip when the route has several trips', () => {
      const addLayer = vi.fn();
      const emit = vi.spyOn(events, 'emit');
      renderWithProviders(
        <LeafletProvider
          value={{ layerContainer: { addLayer, removeLayer: () => {} } }}
        >
          <VehicleMarkerContainer
            direction={undefined}
            topics={[{ route: '2', direction: 0, tripStartTime: '15:14' }]}
          />
        </LeafletProvider>,
        {
          config: {
            ...mockContext.config,
            realTime: {
              tampere: {},
            },
          },
          vehicles: {
            ...vehicles,
            otherTrip: {
              ...vehicles.tampereBus,
              id: 'otherTrip',
              tripStartTime: '1544',
            },
          },
        },
      );

      expect(addLayer).toHaveBeenCalledTimes(1);
      expect(emit).toHaveBeenLastCalledWith('vehiclesChanged', [
        expect.objectContaining({ id: 'tampereBus', visible: true }),
      ]);
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
      expect(shouldShow).toBe(false);
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
      expect(shouldShow).toBe(false);
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
      expect(shouldShow).toBe(false);
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
      expect(shouldShow).toBe(true);
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
      expect(shouldShow).toBe(false);
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
      expect(shouldShow).toBe(false);
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
        1,
        '1514',
        'tampere:2:0:02',
        'Pyynikintori',
      );
      expect(shouldShow).toBe(false);
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
      expect(shouldShow).toBe(true);
    });

    it('should return true when direction, tripStartTime, pattern and headsign are undefined in arguments', () => {
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
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(shouldShow).toBe(true);
    });
  });

  describe('getVehicleIcon', () => {
    describe('modeless icon', () => {
      it('should use a small icon when useLargeIcon is false', () => {
        const icon = getVehicleIcon(null, 180, '32', undefined, false);
        const { container } = render(icon.element);
        expect(container.querySelector('use').getAttribute('xlink:href')).toBe(
          '#icon_all-vehicles-small',
        );
        expect(icon.className).toContain('bus');
      });

      it('should use a large icon when useLargeIcon is true', () => {
        const icon = getVehicleIcon('bus', 180, '32', undefined, true);
        const { container } = render(icon.element);
        expect(container.querySelector('use').getAttribute('xlink:href')).toBe(
          '#icon_vehicle-live-marker',
        );
        expect(icon.className).toContain('bus');
      });
    });
  });
});

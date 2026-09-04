import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';
import TripRouteStop from '../../../app/component/routepage/TripRouteStop';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<TripRouteStop />', () => {
  it('should not render a service alert icon for the trip route stop if the alert is not active', () => {
    const props = {
      currentTime: 1471515614,
      shortName: '',
      distance: false,
      mode: 'bus',
      pattern: 'HSL:4444T:0:02',
      route: 'HSL:4444T',
      selectedVehicle: {},
      color: '#000000',
      stop: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveStartDate: 1471515615,
          },
        ],
      },
      stoptime: {},
      stopPassed: false,
      vehicles: [],
      setHumanScrolling: () => {},
    };
    const { container } = renderWithProviders(<TripRouteStop {...props} />, {
      config: { ...mockContext.config, zones: { stops: true } },
    });
    expect(container.querySelector('.caution')).to.equal(null);
  });
});

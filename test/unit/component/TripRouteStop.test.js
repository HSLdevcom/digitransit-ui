import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import TripRouteStop from '../../../app/component/routepage/TripRouteStop';
import Icon from '../../../app/component/Icon';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
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

  it('should not render a service alert icon when showStopStatusMarkers is enabled', () => {
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
            effectiveStartDate: 1471515600,
          },
        ],
      },
      stoptime: {},
      stopPassed: false,
      vehicles: [],
      setHumanScrolling: () => {},
    };
    const wrapper = mountWithIntl(<TripRouteStop {...props} />, {
      context: {
        config: {
          CONFIG: 'default',
          zones: { stops: true },
          showStopStatusMarkers: true,
        },
      },
    });
    expect(wrapper.find(ServiceAlertIcon)).to.have.lengthOf(0);
  });

  it('should render the status badge icon instead of the SVG circle when the stop has no service', () => {
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
        alerts: [],
        serviceToday: [],
        stoptimesWithoutPatterns: [],
      },
      stoptime: {},
      stopPassed: false,
      vehicles: [],
      setHumanScrolling: () => {},
    };
    const wrapper = mountWithIntl(<TripRouteStop {...props} />, {
      context: {
        config: {
          CONFIG: 'default',
          zones: { stops: true },
          showStopStatusMarkers: true,
        },
      },
    });
    expect(
      wrapper.find(Icon).filter('.route-stop-status-badge'),
    ).to.have.lengthOf(1);
    expect(wrapper.find('.route-stop-now_circleline circle')).to.have.lengthOf(
      0,
    );
  });
});

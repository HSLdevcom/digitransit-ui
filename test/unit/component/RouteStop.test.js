import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';
import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import RouteStop from '../../../app/component/routepage/RouteStop';
import Icon from '../../../app/component/Icon';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<RouteStop />', () => {
  it('should not render a service alert icon for the stop', () => {
    const props = {
      currentTime: 1471515614,
      color: '',
      stop: { alerts: [] },
    };
    const { container } = renderWithProviders(<RouteStop {...props} />, {
      config: {
        ...mockContext.config,
        minutesToDepartureLimit: 0,
        zones: { stops: true },
      },
    });
    expect(container.querySelector('.caution')).to.equal(null);
  });

  it('should render a service alert icon for the stop', () => {
    const props = {
      currentTime: 1471515614,
      color: '',
      stop: {
        alerts: [{ alertSeverityLevel: AlertSeverityLevelType.Warning }],
      },
    };
    const { container } = renderWithProviders(<RouteStop {...props} />, {
      config: {
        ...mockContext.config,
        minutesToDepartureLimit: 0,
        zones: { stops: true },
      },
    });
    expect(container.querySelector('.caution')).to.not.equal(null);
  });

  it('should not render a service alert icon for the stop if the alert is not active', () => {
    const props = {
      currentTime: 1471515614,
      color: '',
      shortName: '',
      mode: 'BUS',
      stop: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveStartDate: 1471515615,
          },
        ],
      },
    };
    const { container } = renderWithProviders(<RouteStop {...props} />, {
      config: {
        ...mockContext.config,
        minutesToDepartureLimit: 0,
        zones: { stops: true },
      },
    });
    expect(container.querySelector('.caution')).to.equal(null);
  });

  it('should not render a service alert icon when showStopStatusMarkers is enabled', () => {
    const props = {
      currentTime: 1471515614,
      color: '',
      stop: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
          },
        ],
      },
    };
    const context = {
      config: {
        CONFIG: 'default',
        minutesToDepartureLimit: 0,
        zones: { stops: true },
        showStopStatusMarkers: true,
      },
    };
    const wrapper = mountWithIntl(<RouteStop {...props} />, { context });
    expect(wrapper.find(ServiceAlertIcon)).to.have.lengthOf(0);
  });

  it('should render the status badge icon instead of the SVG circle when the stop has no service', () => {
    const props = {
      currentTime: 1471515614,
      color: '',
      stop: {
        alerts: [],
        serviceToday: [],
        stoptimesWithoutPatterns: [],
      },
    };
    const context = {
      config: {
        CONFIG: 'default',
        minutesToDepartureLimit: 0,
        zones: { stops: true },
        showStopStatusMarkers: true,
      },
    };
    const wrapper = mountWithIntl(<RouteStop {...props} />, { context });
    expect(
      wrapper.find(Icon).filter('.route-stop-status-badge'),
    ).to.have.lengthOf(1);
    expect(wrapper.find('.route-stop-now_circleline circle')).to.have.lengthOf(
      0,
    );
  });
});

import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { mockContext } from '../helpers/mock-context';
import RouteStop from '../../../app/component/routepage/RouteStop';
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
});

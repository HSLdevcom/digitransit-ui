import React from 'react';
import proxyquire from 'proxyquire';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';
import { MockLink } from '../helpers/MockLink';

describe('<RouteStop />', () => {
  // setup Link component mock to avoid excessive test fixtures
  const { default: RouteStop } = proxyquire(
    '../../../app/component/RouteStop',
    {
      'found/Link': MockLink,
    },
  );

  it('should not render a service alert icon for the stop', () => {
    const props = {
      currentTime: 1471515614,
      stop: {
        alerts: [],
      },
    };
    const context = {
      config: {
        minutesToDepartureLimit: 0,
        zones: { stops: true },
      },
    };
    const wrapper = mountWithIntl(<RouteStop {...props} />, { context });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(true);
  });

  it('should render a service alert icon for the stop', () => {
    const props = {
      currentTime: 1471515614,
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
        minutesToDepartureLimit: 0,
        zones: { stops: true },
      },
    };
    const wrapper = mountWithIntl(<RouteStop {...props} />, { context });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(false);
  });

  it('should not render a service alert icon for the stop if the alert is not active', () => {
    const props = {
      currentTime: 1471515614,
      stop: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveStartDate: 1471515615,
          },
        ],
      },
    };
    const context = {
      config: {
        minutesToDepartureLimit: 0,
        zones: { stops: true },
      },
    };
    const wrapper = mountWithIntl(<RouteStop {...props} />, { context });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(true);
  });
});

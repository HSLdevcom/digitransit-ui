import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import RouteStop from '../../../app/component/RouteStop';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<RouteStop />', () => {
  it('should not render a service alert icon for the stop', () => {
    const props = {
      currentTime: 1471515614,
      color: '',
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
      color: '',
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

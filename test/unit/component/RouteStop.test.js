import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import RouteStop from '../../../app/component/RouteStop';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<RouteStop />', () => {
  it('should not render a service alert icon for the stop', () => {
    const props = {
      currentTime: 1471515614,
      stop: {
        alerts: [],
      },
    };
    const wrapper = mountWithIntl(<RouteStop {...props} />);
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
    const wrapper = mountWithIntl(<RouteStop {...props} />);
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
    const wrapper = mountWithIntl(<RouteStop {...props} />);
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(true);
  });
});

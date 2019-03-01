import React from 'react';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import RouteStop from '../../../app/component/RouteStop';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<RouteStop />', () => {
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
});

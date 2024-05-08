import React from 'react';
import PropTypes from 'prop-types';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import TripRouteStop from '../../../app/component/TripRouteStop';
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
    const wrapper = mountWithIntl(<TripRouteStop {...props} />, {
      context: { config: { CONFIG: 'default', zones: { stops: true } } },
      childContextTypes: { config: PropTypes.object },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(true);
  });
});

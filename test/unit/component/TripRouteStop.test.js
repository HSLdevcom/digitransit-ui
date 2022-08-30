import React from 'react';
import PropTypes from 'prop-types';
import proxyquire from 'proxyquire';

import { mountWithIntl } from '../helpers/mock-intl-enzyme';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';
import { MockLink } from '../helpers/MockLink';

describe('<TripRouteStop />', () => {
  // setup Link component mock to avoid excessive test fixtures
  const { default: TripRouteStop } = proxyquire(
    '../../../app/component/TripRouteStop',
    {
      'found/Link': MockLink,
    },
  );

  it('should not render a service alert icon for the trip route stop if the alert is not active', () => {
    const props = {
      currentTime: 1471515614,
      distance: false,
      mode: 'bus',
      pattern: 'HSL:4444T:0:02',
      route: 'HSL:4444T',
      selectedVehicle: {},
      stop: {
        alerts: [
          {
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            effectiveStartDate: 1471515615,
          },
        ],
      },
      stoptime: {},
    };
    const wrapper = mountWithIntl(<TripRouteStop {...props} />, {
      context: { config: { zones: { stops: true } } },
      childContextTypes: { config: PropTypes.object },
    });
    expect(wrapper.find(ServiceAlertIcon).isEmptyRender()).to.equal(true);
  });
});

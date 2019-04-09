import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import RouteAlertsRow from '../../../app/component/RouteAlertsRow';
import RouteNumber from '../../../app/component/RouteNumber';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';

describe('<RouteAlertsRow />', () => {
  it('should not render a div for the routeLine if it is missing', () => {
    const props = {
      expired: false,
      routeMode: 'foobar',
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.foobar')).to.have.lengthOf(0);
  });

  it('should not render a div for the header if it is missing', () => {
    const props = {
      expired: false,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.route-alert-header')).to.have.lengthOf(0);
  });

  it('should not render a div for the description if it is missing', () => {
    const props = {
      expired: false,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.route-alert-body')).to.have.lengthOf(0);
  });

  it('should render a RouteNumber if a routeMode is provided', () => {
    const props = {
      expired: false,
      routeMode: 'BUS',
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find(RouteNumber)).to.have.lengthOf(1);
  });

  it('should render a ServiceAlertIcon if a routeMode is not provided', () => {
    const props = {
      expired: false,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find(ServiceAlertIcon)).to.have.lengthOf(1);
  });

  it('should show the time period', () => {
    const props = {
      severityLevel: AlertSeverityLevelType.Warning,
      currentTime: 15,
      startTime: 20,
      endTime: 30,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.route-alert-time-period')).to.have.lengthOf(1);
    expect(wrapper.find('.route-alert-time-period').text()).to.contain('at');
  });
});

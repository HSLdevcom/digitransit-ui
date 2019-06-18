import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import IconWithBigCaution from '../../../app/component/IconWithBigCaution';
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

  it('should render a RouteNumber if a mode is provided and the type is route', () => {
    const props = {
      entityMode: 'BUS',
      expired: false,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find(RouteNumber)).to.have.lengthOf(1);
  });

  it('should render an IconWithBigCaution if a mode is provided and the type is stop', () => {
    const props = {
      entityMode: 'BUS',
      entityType: 'stop',
      expired: false,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find(IconWithBigCaution)).to.have.lengthOf(1);
  });

  it('should render a ServiceAlertIcon if a mode is not provided', () => {
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

  it('should not show the time period', () => {
    const props = {
      severityLevel: AlertSeverityLevelType.Info,
      currentTime: 15,
      startTime: 20,
      endTime: 30,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.route-alert-time-period')).to.have.lengthOf(0);
  });

  it('should render the identifier', () => {
    const props = {
      entityIdentifier: '97N',
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.route-alert-top-row').text()).to.equal('97N');
  });

  it('should render the url', () => {
    const props = {
      url: 'https://www.hsl.fi',
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.route-alert-url')).to.have.lengthOf(1);
  });

  it('should render a RouteNumber with a specified alertSeverityLevel', () => {
    const props = {
      entityMode: 'BUS',
      severityLevel: AlertSeverityLevelType.Warning,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find(RouteNumber).prop('alertSeverityLevel')).to.equal(
      AlertSeverityLevelType.Warning,
    );
  });
});

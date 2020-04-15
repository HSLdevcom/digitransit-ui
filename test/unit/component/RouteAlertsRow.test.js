import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import IconWithBigCaution from '../../../app/component/IconWithBigCaution';
import RouteAlertsRow from '../../../app/component/RouteAlertsRow';
import RouteNumber from '../../../app/component/RouteNumber';
import ServiceAlertIcon from '../../../app/component/ServiceAlertIcon';
import { AlertSeverityLevelType } from '../../../app/constants';
import { PREFIX_STOPS, PREFIX_ROUTES } from '../../../app/util/path';

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
      identifier: '7922',
      gtfsIds: 'HSL:27922',
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
      entityType: 'route',
      entityMode: 'bus',
      entityIdentifier: '97N',
      gtfsIds: 'HSL:2097N',
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.bus')).to.have.lengthOf(1);
  });

  it('should render link for route', () => {
    const props = {
      entityType: 'route',
      entityMode: 'bus',
      entityIdentifier: '97N',
      gtfsIds: 'HSL:2097N',
      showRouteNameLink: true,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.route-alert-row-link').get(0).props.to).to.equal(
      `/${PREFIX_ROUTES}/HSL:2097N/${PREFIX_STOPS}/HSL:2097N:0:01`,
    );
  });

  it('should not render the identifier if gtfsIds not provided', () => {
    const props = {
      entityType: 'route',
      entityMode: 'bus',
      entityIdentifier: '97N',
      showRouteNameLink: true,
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.bus')).to.have.lengthOf(0);
  });

  it('should not render the identifier if entityIdentifier not provided', () => {
    const props = {
      entityType: 'route',
      entityMode: 'bus',
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.bus')).to.have.lengthOf(0);
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
  it("should add the http prefix to the url if it's missing", () => {
    const props = {
      url: 'www.hsl.fi',
    };
    const wrapper = shallowWithIntl(<RouteAlertsRow {...props} />);
    expect(wrapper.find('.route-alert-url').prop('href')).to.equal(
      'http://www.hsl.fi',
    );
  });
});

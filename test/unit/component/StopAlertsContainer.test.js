import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as StopAlertsContainer } from '../../../app/component/StopAlertsContainer';
import RouteAlertsContainer from '../../../app/component/RouteAlertsContainer';
import RouteAlertsRow from '../../../app/component/RouteAlertsRow';

import data from '../test-data/StopAlertsContainer.data';

describe('<StopAlertsContainer />', () => {
  it('should show a "no alerts" message', () => {
    const props = {
      currentTime: 1547464412,
      ...data.withoutAlerts,
    };
    const wrapper = shallowWithIntl(<StopAlertsContainer {...props} />);
    expect(wrapper.find('.stop-no-alerts-container')).to.have.lengthOf(1);
  });

  it('should show all the cancelations', () => {
    const props = {
      currentTime: 1547599600,
      ...data.withCancelations,
    };
    const wrapper = shallowWithIntl(<StopAlertsContainer {...props} />);
    expect(wrapper.find(RouteAlertsRow)).to.have.lengthOf(2);
  });

  it('should show all the service alerts', () => {
    const props = {
      currentTime: 1547464412,
      ...data.withAlerts,
    };
    const wrapper = shallowWithIntl(<StopAlertsContainer {...props} />);
    expect(wrapper.find(RouteAlertsContainer)).to.have.lengthOf(18);
  });
});

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
    expect(wrapper.find('.no-stop-alerts-message')).to.have.lengthOf(1);
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

  it('should order the alerts by route shortName', () => {
    const props = {
      currentTime: 1547464412,
      stop: {
        stoptimesForServiceDate: [
          {
            pattern: {
              code: 'second',
              route: {
                alerts: [{}],
                mode: 'BUS',
                shortName: '37N',
              },
            },
          },
          {
            pattern: {
              code: 'fourth',
              route: {
                alerts: [{}],
                mode: 'RAIL',
                shortName: 'A',
              },
            },
          },
          {
            pattern: {
              code: 'third',
              route: {
                alerts: [{}],
                mode: 'BUS',
                shortName: '138',
              },
            },
          },
          {
            pattern: {
              code: 'first',
              route: {
                alerts: [{}],
                mode: 'TRAM',
                shortName: '8A',
              },
            },
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<StopAlertsContainer {...props} />);
    expect(
      wrapper
        .find(RouteAlertsContainer)
        .at(0)
        .props().patternId,
    ).to.equal('first');
    expect(
      wrapper
        .find(RouteAlertsContainer)
        .at(1)
        .props().patternId,
    ).to.equal('second');
    expect(
      wrapper
        .find(RouteAlertsContainer)
        .at(2)
        .props().patternId,
    ).to.equal('third');
    expect(
      wrapper
        .find(RouteAlertsContainer)
        .at(3)
        .props().patternId,
    ).to.equal('fourth');
  });
});

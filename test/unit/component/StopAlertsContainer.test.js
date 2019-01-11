import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as StopAlertsContainer } from '../../../app/component/StopAlertsContainer';
import RouteAlertsContainer from '../../../app/component/RouteAlertsContainer';

import data from '../test-data/StopAlertsContainer.data';

describe('<StopAlertsContainer />', () => {
  it('should show a "no alerts" message', () => {
    const props = {
      ...data.withoutAlerts,
    };
    const wrapper = shallowWithIntl(<StopAlertsContainer {...props} />);
    expect(wrapper.find('.no-stop-alerts-message')).to.have.lengthOf(1);
  });

  it('should show all the alerts', () => {
    const props = {
      ...data.withAlerts,
    };
    const wrapper = shallowWithIntl(<StopAlertsContainer {...props} />);
    expect(wrapper.find(RouteAlertsContainer)).to.have.lengthOf(18);
  });

  it('should order the alerts by route shortName', () => {
    const props = {
      stop: {
        stoptimesForPatterns: [
          {
            pattern: {
              code: 'second',
              route: {
                alerts: [{}],
                shortName: '37N',
              },
            },
          },
          {
            pattern: {
              code: 'fourth',
              route: {
                alerts: [{}],
                shortName: 'A',
              },
            },
          },
          {
            pattern: {
              code: 'third',
              route: {
                alerts: [{}],
                shortName: '138',
              },
            },
          },
          {
            pattern: {
              code: 'first',
              route: {
                alerts: [{}],
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

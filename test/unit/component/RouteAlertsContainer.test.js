import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import DisruptionList from '../../../app/component/DisruptionList';
import { Component as RouteAlertsContainer } from '../../../app/component/routepage/RouteAlertsContainer';

const defaultRoute = {
  gtfsId: 'HSL:1063',
  mode: 'BUS',
  shortName: '63',
};

const defaultStops = [{ name: 'First stop' }, { name: 'Last stop' }];

describe('<RouteAlertsContainer />', () => {
  it('should pass empty arrays when there are no alerts or cancelations', () => {
    const props = {
      currentTime: 1558599526,
      route: defaultRoute,
      pattern: {
        alerts: [],
        stops: defaultStops,
        trips: [
          {
            stoptimes: [
              {
                serviceDay: 1533675600,
                scheduledDeparture: 600,
                headsign: 'Kamppi',
                realtimeState: 'SCHEDULED',
                stop: { name: 'Saramäentie' },
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find(DisruptionList).props()).to.deep.equal({
      cancelations: [],
      serviceAlerts: [],
      showLinks: false,
    });
  });

  it('should pass cancelations when there are canceled stoptimes', () => {
    const props = {
      currentTime: 1558599526,
      route: defaultRoute,
      pattern: {
        alerts: [],
        stops: defaultStops,
        trips: [
          {
            stoptimes: [
              {
                headsign: 'Kamppi',
                serviceDay: 1533675600,
                scheduledDeparture: 600,
                realtimeState: 'CANCELED',
                stop: { name: 'Saramäentie' },
              },
            ],
          },
          {
            stoptimes: [
              {
                serviceDay: 1533675600,
                scheduledDeparture: 600,
                headsign: 'Kamppi',
                realtimeState: 'SCHEDULED',
                stop: { name: 'Saramäentie' },
              },
            ],
          },
        ],
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find(DisruptionList).prop('cancelations')).to.have.lengthOf(
      1,
    );
  });

  it('should pass service alerts from the pattern', () => {
    const props = {
      currentTime: 1558599526,
      route: {
        gtfsId: 'HSL:2335',
        color: null,
        mode: 'BUS',
        shortName: '335',
      },
      pattern: {
        stops: defaultStops,
        alerts: [
          {
            alertHeaderText: null,
            alertDescriptionText: 'Route 335 canceled due to disruption.',
          },
        ],
        trips: [],
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find(DisruptionList).prop('serviceAlerts')).to.have.lengthOf(
      1,
    );
  });
});

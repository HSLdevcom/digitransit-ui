import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import AlertList from '../../../app/component/AlertList';
import { Component as RouteAlertsContainer } from '../../../app/component/RouteAlertsContainer';

describe('<RouteAlertsContainer />', () => {
  it('should indicate that there are no alerts if the route has no alerts nor canceled stoptimes', () => {
    const props = {
      currentTime: 1558599526,
      route: {
        gtfsId: 'HSL:1063',
        alerts: [],
        mode: 'BUS',
        patterns: [
          {
            code: 'HSL:1063:0:01',
            trips: [
              {
                stoptimes: [
                  {
                    headsign: 'Kamppi',
                    realtimeState: 'SCHEDULED',
                    stop: {
                      name: 'Saramäentie',
                    },
                  },
                ],
              },
            ],
          },
        ],
        shortName: '63',
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: {
        ...mockContext,
        match: { params: { patternId: 'HSL:1063:0:01' } },
      },
    });
    expect(wrapper.find(AlertList).props()).to.deep.equal({
      cancelations: [],
      serviceAlerts: [],
      showLinks: false,
    });
  });

  it('should indicate that there are no alerts if there are canceled stoptimes but not for the current patternId', () => {
    const props = {
      currentTime: 1558599526,
      route: {
        gtfsId: 'HSL:1063',
        alerts: [],
        mode: 'BUS',
        patterns: [
          {
            code: 'HSL:1063:0:01',
            trips: [
              {
                stoptimes: [
                  {
                    headsign: 'Kamppi',
                    realtimeState: 'CANCELED',
                    stop: {
                      name: 'Saramäentie',
                    },
                  },
                ],
              },
            ],
          },
        ],
        shortName: '63',
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: {
        ...mockContext,
        match: { params: { patternId: 'HSL:1063:0:02' } },
      },
    });
    expect(wrapper.find(AlertList).props()).to.deep.equal({
      cancelations: [],
      serviceAlerts: [],
      showLinks: false,
    });
  });

  it('should indicate that there are cancelations if there are canceled stoptimes with the current patternId', () => {
    const props = {
      currentTime: 1558599526,
      route: {
        gtfsId: 'HSL:1063',
        alerts: [],
        mode: 'BUS',
        patterns: [
          {
            code: 'HSL:1063:0:01',
            trips: [
              {
                stoptimes: [
                  {
                    headsign: 'Kamppi',
                    realtimeState: 'CANCELED',
                    stop: {
                      name: 'Saramäentie',
                    },
                  },
                ],
              },
              {
                stoptimes: [
                  {
                    headsign: 'Kamppi',
                    realtimeState: 'SCHEDULED',
                    stop: {
                      name: 'Saramäentie',
                    },
                  },
                ],
              },
            ],
          },
        ],
        shortName: '63',
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: {
        ...mockContext,
        match: { params: { patternId: 'HSL:1063:0:01' } },
      },
    });
    expect(wrapper.find(AlertList).prop('cancelations')).to.have.lengthOf(1);
  });

  it('should indicate that there are service alerts', () => {
    const props = {
      currentTime: 1558599526,
      route: {
        gtfsId: 'HSL:2335',
        alerts: [
          {
            alertHeaderText: null,
            alertDescriptionText:
              'Vantaan sisäisen liikenteen linja 335 Linnaisista, klo 11:59 peruttu. Syy: tilapäinen häiriö.',
          },
        ],
        color: null,
        mode: 'BUS',
        patterns: [],
        shortName: '335',
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find(AlertList).prop('serviceAlerts')).to.have.lengthOf(1);
  });

  it('should use the tripHeadsign if the stoptime does not have a headsign', () => {
    const props = {
      currentTime: 1558599526,
      route: {
        gtfsId: 'HSL:1063',
        alerts: [],
        mode: 'BUS',
        patterns: [
          {
            code: 'HSL:1063:0:01',
            trips: [
              {
                tripHeadsign: 'foobar',
                stoptimes: [
                  {
                    headsign: null,
                    realtimeState: 'CANCELED',
                    scheduledArrival: 1,
                    scheduledDeparture: 2,
                    serviceDay: 3,
                    stop: {
                      name: 'Saramäentie 11',
                    },
                  },
                ],
              },
            ],
          },
        ],
        shortName: '63',
      },
    };
    const wrapper = shallowWithIntl(<RouteAlertsContainer {...props} />, {
      context: {
        ...mockContext,
        match: { params: { patternId: 'HSL:1063:0:01' } },
      },
    });
    expect(
      wrapper.find(AlertList).prop('cancelations')[0].alertDescriptionText,
    ).to.include('foobar');
  });
});

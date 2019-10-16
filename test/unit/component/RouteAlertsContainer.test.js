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
      patternId: 'HSL:1063:0:01',
      route: {
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
      context: { ...mockContext },
    });
    expect(wrapper.find(AlertList).props()).to.deep.equal({
      cancelations: [],
      serviceAlerts: [],
      showRouteNameLink: false,
    });
  });

  it('should indicate that there are no alerts if there are canceled stoptimes but not for the current patternId', () => {
    const props = {
      patternId: 'HSL:1063:0:02',
      route: {
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
      context: { ...mockContext },
    });
    expect(wrapper.find(AlertList).props()).to.deep.equal({
      cancelations: [],
      serviceAlerts: [],
      showRouteNameLink: false,
    });
  });

  it('should indicate that there are cancelations if there are canceled stoptimes with the current patternId', () => {
    const props = {
      patternId: 'HSL:1063:0:01',
      route: {
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
      context: { ...mockContext },
    });
    expect(wrapper.find(AlertList).prop('cancelations')).to.have.lengthOf(1);
  });

  it('should use the first and last stoptimes as the startTime and endTime for validityPeriod', () => {
    const props = {
      patternId: 'HSL:1063:0:01',
      route: {
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
                    scheduledDeparture: 2,
                    serviceDay: 1,
                    stop: {
                      name: 'Saramäentie 1',
                    },
                  },
                  {
                    headsign: 'Kamppi',
                    realtimeState: 'CANCELED',
                    scheduledArrival: 3,
                    serviceDay: 2,
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
      context: { ...mockContext },
    });
    const cancelation = wrapper.find(AlertList).prop('cancelations')[0];
    expect(cancelation.validityPeriod.startTime).to.equal(3);
    expect(cancelation.validityPeriod.endTime).to.equal(5);
  });

  it('should indicate that there are service alerts', () => {
    const props = {
      route: {
        alerts: [
          {
            alertHeaderText: null,
            alertHeaderTextTranslations: [],
            alertDescriptionText:
              'Vantaan sisäisen liikenteen linja 335 Linnaisista, klo 11:59 peruttu. Syy: tilapäinen häiriö.',
            alertDescriptionTextTranslations: [
              {
                text:
                  'Vantaan sisäisen liikenteen linja 335 Linnaisista, klo 11:59 peruttu. Syy: tilapäinen häiriö.',
                language: 'fi',
              },
              {
                text:
                  'Vanda lokaltrafik, linje 335 från Linnais, kl. 11:59 inställd. Orsak: tillfällig störning.',
                language: 'sv',
              },
              {
                text:
                  'Vantaa local traffic, line 335 from Linnainen, 11:59 cancelled. Cause: temporary disruption.',
                language: 'en',
              },
            ],
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
      patternId: 'HSL:1063:0:01',
      route: {
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
      context: { ...mockContext },
    });
    expect(
      wrapper.find(AlertList).prop('cancelations')[0].header.props.headsign,
    ).to.equal('foobar');
  });
});

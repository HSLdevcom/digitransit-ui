import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { renderWithProviders } from '../helpers/mock-providers';
import { Component as RouteAlertsContainer } from '../../../app/component/routepage/RouteAlertsContainer';

describe('<RouteAlertsContainer />', () => {
  it('should indicate that there are no alerts if the route has no alerts nor canceled stoptimes', () => {
    const props = {
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        shortName: '63',
      },
      pattern: {
        alerts: [],
        code: 'HSL:1063:0:01',
        trips: [
          {
            stoptimes: [
              {
                serviceDay: 1533675600,
                scheduledDeparture: 600,
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
    };
    const { container } = renderWithProviders(
      <RouteAlertsContainer {...props} />,
      { currentTime: 1558599526 },
    );
    expect(container.querySelector('.no-alerts-container')).to.not.equal(null);
  });

  it('should indicate that there are cancelations if there are canceled stoptimes for the selected pattern', () => {
    const props = {
      route: {
        gtfsId: 'HSL:1063',
        mode: 'BUS',
        shortName: '63',
      },
      pattern: {
        alerts: [],
        code: 'HSL:1063:0:01',
        trips: [
          {
            stoptimes: [
              {
                headsign: 'Kamppi',
                serviceDay: 1533675600,
                scheduledDeparture: 600,
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
                serviceDay: 1533675600,
                scheduledDeparture: 600,
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
    };
    const { container } = renderWithProviders(
      <RouteAlertsContainer {...props} />,
      { currentTime: 1558599526 },
    );
    expect(container.querySelector('.alerts-list')).to.not.equal(null);
  });

  it('should indicate that there are service alerts', () => {
    const props = {
      route: {
        gtfsId: 'HSL:2335',
        color: null,
        mode: 'BUS',
        patterns: [
          {
            code: 'HSL:2335:0:01',
          },
        ],
        shortName: '335',
      },
      pattern: {
        code: 'HSL:2335:0:01',
        alerts: [
          {
            alertHeaderText: null,
            alertDescriptionText:
              'Vantaan sisäisen liikenteen linja 335 Linnaisista, klo 11:59 peruttu. Syy: tilapäinen häiriö.',
          },
        ],
        trips: [],
      },
    };
    const { container } = renderWithProviders(
      <RouteAlertsContainer {...props} />,
      { currentTime: 1558599526 },
    );
    expect(container.querySelector('.alerts-list')).to.not.equal(null);
  });
});

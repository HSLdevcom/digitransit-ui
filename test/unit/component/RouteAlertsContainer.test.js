import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { renderWithProviders } from '../helpers/mock-providers';
import RouteAlertsContainer from '../../../app/component/routepage/RouteAlertsContainer';

const defaultRoute = {
  gtfsId: 'HSL:1063',
  mode: 'BUS',
  shortName: '63',
};

const defaultStops = [{ name: 'First stop' }, { name: 'Last stop' }];

const renderContainer = props =>
  renderWithProviders(<RouteAlertsContainer {...props} />).container;

describe('<RouteAlertsContainer />', () => {
  it('should pass empty arrays when there are no alerts or cancelations', () => {
    const container = renderContainer({
      route: defaultRoute,
      pattern: {
        alerts: [],
        stops: defaultStops,
        canceledTrips: [],
      },
    });
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(0);
    expect(container.textContent).to.contain('Services normal');
  });

  it('should pass cancelations when there are canceled stoptimes', () => {
    const container = renderContainer({
      route: defaultRoute,
      pattern: {
        alerts: [],
        stops: defaultStops,
        canceledTrips: [
          {
            serviceDate: '2026-07-28',
            trip: {
              tripHeadsign: 'FOO',
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
          },
        ],
      },
    });
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(1);
  });

  it('should pass service alerts from the pattern', () => {
    const container = renderContainer({
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
            id: 'alert-335',
            alertHeaderText: null,
            alertDescriptionText: 'Route 335 canceled due to disruption.',
          },
        ],
        trips: [],
      },
    });
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(1);
  });
});

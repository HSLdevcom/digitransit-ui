import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { DateTime } from 'luxon';

import { renderWithProviders } from '../helpers/mock-providers';
import {
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../utils/shared/constants';
import Disruptions from '../../../app/component/stop/Disruptions';

const renderDisruptions = props =>
  renderWithProviders(<Disruptions {...props} />).container;

describe('<Disruptions />', () => {
  it("should indicate that there are no alerts if the stop's routes have no alerts and the stop has no canceled stoptimes", () => {
    const props = {
      stop: {
        gtfsId: 'feed:bar',
        locationType: 'STOP',
        code: '321',
        alerts: [],
        routes: [],
        stoptimes: [
          {
            headsign: 'Kamppi',
            realtimeState: 'SCHEDULED',
            trip: {
              tripHeadsign: 'Kamppi',
              route: {
                gtfsId: 'feed:63',
                alerts: [],
                mode: 'BUS',
                shortName: '63',
              },
              stops: [
                {
                  name: 'Saramäentie',
                },
              ],
            },
          },
        ],
      },
    };
    const container = renderDisruptions(props);
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(0);
    expect(container.textContent).to.contain('Services normal');
  });

  it('should indicate that there is a direct service alert on a route', () => {
    const props = {
      stop: {
        gtfsId: 'feed:bar',
        locationType: 'STOP',
        code: '321',
        alerts: [
          {
            id: 'alert-101',
            alertHeaderText: 'Route disrupted',
            entities: [
              {
                __typename: AlertEntityType.Route,
                gtfsId: 'feed:101',
              },
            ],
          },
        ],
        stoptimes: [],
        routes: [
          {
            gtfsId: 'feed:101',
          },
        ],
      },
    };
    const container = renderDisruptions(props);
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(1);
  });

  it('should indicate that there is a canceled stoptime on a route', () => {
    const props = {
      stop: {
        gtfsId: 'feed:bar',
        locationType: 'STOP',
        code: '431',
        alerts: [],
        routes: [],
        canceledCalls: [
          {
            stopCall: {
              schedule: { time: { departure: DateTime.now().toISO() } },
              stopLocation: { gtfsId: 'feed:bar' },
            },
            tripOnServiceDate: {
              serviceDate: DateTime.now().toISODate(),
              trip: {
                tripHeadsign: 'Kamppi',
                gtfsId: 'feed:63:01-1',
                route: {
                  gtfsId: 'feed:63',
                  type: 3,
                  color: undefined,
                  mode: 'BUS',
                  shortName: '63',
                },
                pattern: {
                  code: 'feed:63:01',
                  headsign: 'Kamppi',
                  stops: [
                    { name: 'foo', gtfsId: 'feed:bar' },
                    { name: 'foo', gtfsId: 'feed:foo' },
                  ],
                },
              },
            },
          },
        ],
      },
    };
    const container = renderDisruptions(props);
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(1);
  });

  it('should render multiple canceled departure times for the same trip pattern in chronological order', () => {
    const baseTime = DateTime.now().set({
      hour: 12,
      minute: 0,
      second: 0,
      millisecond: 0,
    });
    const tripOnServiceDate = {
      serviceDate: baseTime.toISODate(),
      trip: {
        tripHeadsign: 'Kamppi',
        gtfsId: 'feed:63:01-1',
        route: {
          gtfsId: 'feed:63',
          type: 3,
          color: undefined,
          mode: 'BUS',
          shortName: '63',
        },
        pattern: {
          code: 'feed:63:01',
          headsign: 'Kamppi',
          stops: [
            { name: 'foo', gtfsId: 'feed:bar' },
            { name: 'foo', gtfsId: 'feed:foo' },
          ],
        },
      },
    };
    const props = {
      stop: {
        gtfsId: 'feed:bar',
        locationType: 'STOP',
        code: '431',
        alerts: [],
        routes: [],
        // listed out of chronological order on purpose
        canceledCalls: [
          {
            stopCall: {
              schedule: {
                time: { departure: baseTime.plus({ hours: 2 }).toISO() },
              },
              stopLocation: { gtfsId: 'feed:bar' },
            },
            tripOnServiceDate,
          },
          {
            stopCall: {
              schedule: {
                time: { departure: baseTime.minus({ hours: 3 }).toISO() },
              },
              stopLocation: { gtfsId: 'feed:bar' },
            },
            tripOnServiceDate,
          },
        ],
      },
    };
    const container = renderDisruptions(props);
    const badges = container.querySelectorAll('.cancelation-badge .canceled');
    expect(badges).to.have.lengthOf(2);
    expect(badges[0].textContent).to.equal(
      baseTime.minus({ hours: 3 }).toFormat('HH:mm'),
    );
    expect(badges[1].textContent).to.equal(
      baseTime.plus({ hours: 2 }).toFormat('HH:mm'),
    );
  });

  it('should filter out a canceled call if the trip terminates on the stop', () => {
    const props = {
      stop: {
        gtfsId: 'feed:bar',
        locationType: 'STOP',
        code: '431',
        alerts: [],
        routes: [],
        canceledCalls: [
          {
            stopCall: {
              schedule: { time: { departure: DateTime.now().toISO() } },
              stopLocation: { gtfsId: 'feed:bar' },
            },
            tripOnServiceDate: {
              serviceDate: DateTime.now().toISODate(),
              trip: {
                tripHeadsign: 'Kamppi',
                gtfsId: 'feed:63:01-1',
                route: {
                  gtfsId: 'feed:63',
                  type: 3,
                  color: undefined,
                  mode: 'BUS',
                  shortName: '63',
                },
                pattern: {
                  code: 'feed:63:01',
                  headsign: 'Kamppi',
                  stops: [
                    { name: 'foo', gtfsId: 'feed:bar' },
                    { name: 'foo', gtfsId: 'feed:foo' },
                    { name: 'foo', gtfsId: 'feed:bar' },
                  ],
                },
              },
            },
          },
        ],
      },
    };
    const container = renderDisruptions(props);
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(0);
    expect(container.textContent).to.contain('Services normal');
  });

  it('should indicate that the stop itself has a service alert', () => {
    const props = {
      stop: {
        gtfsId: 'feed:bar',
        locationType: 'STOP',
        code: '321',
        alerts: [
          {
            id: 'alert-bar',
            alertHeaderText: 'Stop disrupted',
            alertSeverityLevel: AlertSeverityLevelType.Warning,
            entities: [
              {
                __typename: AlertEntityType.Stop,
                gtfsId: 'feed:bar',
              },
            ],
          },
        ],
        routes: [],
        stoptimes: [],
      },
    };
    const container = renderDisruptions(props);
    expect(container.querySelectorAll('.alert-row')).to.have.lengthOf(1);
  });
});

import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { DateTime } from 'luxon';
import { mockContext } from '../helpers/mock-context';
import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import {
  AlertSeverityLevelType,
  AlertEntityType,
} from '../../../app/constants';
import DisruptionList from '../../../app/component/DisruptionList';
import Disruptions from '../../../app/component/stop/Disruptions';

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
    const wrapper = shallowWithIntl(<Disruptions {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find(DisruptionList).props()).to.deep.equal({
      cancelations: [],
      serviceAlerts: [],
    });
  });

  it('should indicate that there is a direct service alert on a route', () => {
    const props = {
      stop: {
        gtfsId: 'feed:bar',
        locationType: 'STOP',
        code: '321',
        alerts: [
          {
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
    const wrapper = shallowWithIntl(<Disruptions {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find(DisruptionList).prop('serviceAlerts')).to.have.lengthOf(
      1,
    );
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
                  type: 'foo',
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
    const wrapper = shallowWithIntl(<Disruptions {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find(DisruptionList).prop('cancelations')).to.have.lengthOf(
      1,
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
                  type: 'foo',
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
    const wrapper = shallowWithIntl(<Disruptions {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find(DisruptionList).prop('cancelations')).to.have.lengthOf(
      0,
    );
  });

  it('should indicate that the stop itself has a service alert', () => {
    const props = {
      stop: {
        gtfsId: 'feed:bar',
        locationType: 'STOP',
        code: '321',
        alerts: [
          {
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
    const wrapper = shallowWithIntl(<Disruptions {...props} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find(DisruptionList).prop('serviceAlerts')).to.have.lengthOf(
      1,
    );
  });
});

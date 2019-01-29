import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as RouteScheduleContainer } from '../../../app/component/RouteScheduleContainer';
import RouteScheduleTripRow from '../../../app/component/RouteScheduleTripRow';
import { mockContext } from '../helpers/mock-context';

describe('<RouteScheduleContainer />', () => {
  it('should identify canceled departures from incoming data', () => {
    const props = {
      pattern: {
        stops: [
          {
            name: 'Koskela',
          },
          {
            name: 'Rautatientori',
          },
        ],
        tripsForDate: [
          {
            id: 'trip-1',
            stoptimes: [
              {
                realtimeState: 'CANCELED',
                scheduledArrival: 28080,
                scheduledDeparture: 28080,
                serviceDay: 1547503200,
              },
              {
                realtimeState: 'CANCELED',
                scheduledArrival: 30060,
                scheduledDeparture: 30060,
                serviceDay: 1547503200,
              },
            ],
          },
        ],
        route: { gtfsId: '2550' },
      },
      relay: {
        setVariables: () => {},
        variables: {
          serviceDay: '20190115',
        },
      },
      serviceDay: '20190115',
    };
    const wrapper = shallowWithIntl(<RouteScheduleContainer {...props} />, {
      context: mockContext,
    });
    expect(wrapper.find(RouteScheduleTripRow)).to.have.lengthOf(1);
    expect(
      wrapper
        .find(RouteScheduleTripRow)
        .at(0)
        .props().isCanceled,
    ).to.equal(true);
  });
});

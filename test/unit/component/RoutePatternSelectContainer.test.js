import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { DateTime } from 'luxon';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext } from '../helpers/mock-context';
import { Component as RoutePatternSelectContainer } from '../../../app/component/routepage/RoutePatternSelectContainer';
import RoutePatternSelect from '../../../app/component/routepage/RoutePatternSelect';

const serviceDay = Math.floor(new Date().getTime() / 1000);
const today = DateTime.now().toFormat('yyyyLLdd');

function makeActiveDates() {
  // activeDates on the pattern is an array of { serviceId, day: [dateString] } objects,
  // matching the GraphQL fragment shape: activeDates: trips { serviceId day: activeDates }
  return [{ serviceId: 'service1', day: [today] }];
}

function makePattern(code, directionId, headsign, tripsForDate = []) {
  return {
    code,
    directionId,
    headsign,
    stops: [{ name: 'Origin' }, { name: 'Destination' }],
    tripsForDate,
    activeDates: tripsForDate.length > 0 ? makeActiveDates() : [],
  };
}

function makeTripForDate() {
  return {
    stoptimes: [
      {
        scheduledArrival: 600,
        scheduledDeparture: 600,
        serviceDay,
      },
      {
        scheduledArrival: 720,
        scheduledDeparture: 720,
        serviceDay,
      },
    ],
  };
}

const baseContext = {
  ...mockContext,
  config: {
    ...mockContext.config,
    itinerary: { serviceTimeRange: 30 },
    showSimilarRoutesOnRouteDropDown: false,
  },
};

const baseProps = {
  params: { patternId: 'ROUTE:1:0:01' },
  className: 'bp-large',
  onSelectChange: () => {},
  gtfsId: 'ROUTE:1',
  relayEnvironment: {},
};

describe('<RoutePatternSelectContainer />', () => {
  describe('Toggle button rendering', () => {
    it('renders a toggle button when there are exactly two opposite-direction patterns and no special routes', () => {
      const props = {
        ...baseProps,
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
            makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
          ],
        },
      };
      const wrapper = shallowWithIntl(
        <RoutePatternSelectContainer {...props} />,
        { context: baseContext },
      );
      expect(wrapper.find('button.route-pattern-toggle')).to.have.lengthOf(1);
    });

    it('does not render RoutePatternSelect when only two opposite-direction patterns exist', () => {
      const props = {
        ...baseProps,
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
            makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
          ],
        },
      };
      const wrapper = shallowWithIntl(
        <RoutePatternSelectContainer {...props} />,
        { context: baseContext },
      );
      expect(wrapper.find(RoutePatternSelect)).to.have.lengthOf(0);
    });
  });

  describe('Dropdown rendering', () => {
    it('renders RoutePatternSelect when there are more than two distinct patterns', () => {
      const props = {
        ...baseProps,
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
            makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
            makePattern('ROUTE:1:0:02', 0, 'Via Downtown', [makeTripForDate()]),
          ],
        },
      };
      const wrapper = shallowWithIntl(
        <RoutePatternSelectContainer {...props} />,
        { context: baseContext },
      );
      expect(wrapper.find(RoutePatternSelect)).to.have.lengthOf(1);
    });

    it('passes grouped optionArray to RoutePatternSelect', () => {
      const props = {
        ...baseProps,
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
            makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
            makePattern('ROUTE:1:0:02', 0, 'Via Downtown', [makeTripForDate()]),
          ],
        },
      };
      const wrapper = shallowWithIntl(
        <RoutePatternSelectContainer {...props} />,
        { context: baseContext },
      );
      const optionArray = wrapper.find(RoutePatternSelect).prop('optionArray');
      expect(optionArray).to.be.an('array');
      expect(optionArray.length).to.be.above(0);
      const allOptions = optionArray.flatMap(g => g.options);
      expect(allOptions.length).to.be.above(0);
    });
  });

  describe('Pattern not found – redirect', () => {
    it('calls router.replace when the current patternId does not match any available pattern', () => {
      let replacedUrl;
      const contextWithSpy = {
        ...baseContext,
        router: {
          ...baseContext.router,
          replace: url => {
            replacedUrl = url;
          },
        },
      };
      const props = {
        ...baseProps,
        params: { patternId: 'ROUTE:1:NONEXISTENT' },
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
            makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
          ],
        },
      };
      shallowWithIntl(<RoutePatternSelectContainer {...props} />, {
        context: contextWithSpy,
      });
      // The URL is encoded, so colons become %3A
      expect(replacedUrl).to.include('ROUTE');
      expect(replacedUrl).to.include('0');
      expect(replacedUrl).to.include('01');
    });
  });

  describe('No trips for today', () => {
    it('falls back to showing main-direction patterns when no trips or active dates exist', () => {
      // enrichPatterns falls back to patterns ending in ':01' when no future trips are found
      const props = {
        ...baseProps,
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination'),
            makePattern('ROUTE:1:1:01', 1, 'Origin'),
          ],
        },
      };
      const wrapper = shallowWithIntl(
        <RoutePatternSelectContainer {...props} />,
        { context: baseContext },
      );
      expect(wrapper.isEmptyRender()).to.equal(false);
    });
  });
});

import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { DateTime } from 'luxon';

import { mountWithProviders } from '../helpers/mock-intl-enzyme';
import { mockMatch, mockRouter } from '../helpers/mock-router';
import { Component as RoutePatternSelectContainer } from '../../../app/component/routepage/RoutePatternSelectContainer';
import RoutePatternSelect from '../../../app/component/routepage/RoutePatternSelect';
import { routePagePath, PREFIX_STOPS } from '../../../app/util/path';

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

const baseConfig = {
  CONFIG: 'default',
  timeZone: 'Europe/Helsinki',
  colors: { primary: '#3fa', accessiblePrimary: '#333' },
  itinerary: { serviceTimeRange: 30 },
  showSimilarRoutesOnRouteDropDown: false,
};

const baseMatch = {
  ...mockMatch,
  params: { patternId: 'ROUTE:1:0:01' },
};

const baseProps = {
  match: baseMatch,
  className: 'bp-large',
  onSelectChange: () => {},
  gtfsId: 'ROUTE:1',
  relayEnvironment: {},
};

/** Shared route with exactly two opposite-direction patterns. */
function makeTwoDirectionRoute() {
  return {
    shortName: '1',
    mode: 'BUS',
    gtfsId: 'ROUTE:1',
    patterns: [
      makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
      makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
    ],
  };
}

describe('<RoutePatternSelectContainer />', () => {
  describe('Toggle button rendering', () => {
    it('renders a toggle button (not a dropdown) when there are exactly two opposite-direction patterns', () => {
      const props = { ...baseProps, route: makeTwoDirectionRoute() };
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig, router: mockRouter },
      );
      expect(wrapper.find('button.route-pattern-toggle')).to.have.lengthOf(1);
      expect(wrapper.find(RoutePatternSelect)).to.have.lengthOf(0);
    });

    it('calls onSelectChange with the other pattern code when the toggle button is clicked', () => {
      let selectedCode;
      const props = {
        ...baseProps,
        onSelectChange: code => {
          selectedCode = code;
        },
        route: makeTwoDirectionRoute(),
      };
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig, router: mockRouter },
      );
      wrapper.find('button.route-pattern-toggle').simulate('click');
      // The active pattern is ROUTE:1:0:01; clicking swap should select the opposite direction.
      expect(selectedCode).to.equal('ROUTE:1:1:01');
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
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig, router: mockRouter },
      );
      expect(wrapper.find(RoutePatternSelect)).to.have.lengthOf(1);
    });

    it('groups all patterns into a single unnamed main group in the optionArray', () => {
      const patterns = [
        makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
        makePattern('ROUTE:1:1:01', 1, 'Origin', [makeTripForDate()]),
        makePattern('ROUTE:1:0:02', 0, 'Via Downtown', [makeTripForDate()]),
      ];
      const props = {
        ...baseProps,
        route: { shortName: '1', mode: 'BUS', gtfsId: 'ROUTE:1', patterns },
      };
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig, router: mockRouter },
      );
      const optionArray = wrapper.find(RoutePatternSelect).prop('optionArray');

      // Main (non-special, non-future) patterns land in a group with an empty name.
      expect(optionArray[0].name).to.equal('');

      // Every supplied pattern code must appear exactly once across all groups.
      const allCodes = optionArray.flatMap(g => g.options.map(o => o.code));
      expect(allCodes).to.have.lengthOf(patterns.length);
      patterns.forEach(p => expect(allCodes).to.include(p.code));
    });
  });

  describe('Pattern not found – redirect', () => {
    it('redirects to the first available pattern URL when the current patternId is not found', () => {
      let replacedUrl;
      const matchWithSpy = {
        ...mockMatch,
        params: { patternId: 'ROUTE:1:NONEXISTENT' },
        router: {
          ...mockRouter,
          replace: url => {
            replacedUrl = url;
          },
        },
      };
      const props = {
        ...baseProps,
        match: matchWithSpy,
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
      mountWithProviders(<RoutePatternSelectContainer {...props} />, {
        config: baseConfig,
        router: matchWithSpy.router,
      });
      // The container redirects to routePagePath(gtfsId, PREFIX_STOPS, options[0].code).
      // Colons in IDs are percent-encoded (%3A), so build the expected URL the same way.
      const expectedUrl = routePagePath(
        'ROUTE:1',
        PREFIX_STOPS,
        'ROUTE:1:0:01',
      );
      expect(replacedUrl).to.equal(expectedUrl);
    });
  });

  describe('No trips for today', () => {
    it('shows the toggle button using fallback patterns (codes ending in :01) when no trips exist', () => {
      // enrichPatterns falls back to patterns whose code ends in ':01' when no trips are found.
      // With two opposite-direction fallback patterns the container should render the toggle button.
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
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig, router: mockRouter },
      );
      expect(wrapper.find('button.route-pattern-toggle')).to.have.lengthOf(1);
    });
  });
});

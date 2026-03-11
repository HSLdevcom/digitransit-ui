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
        scheduledDeparture: 600,
        serviceDay,
      },
      {
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
        { config: baseConfig },
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
        { config: baseConfig },
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
        { config: baseConfig },
      );
      expect(wrapper.find(RoutePatternSelect)).to.have.lengthOf(1);
    });

    it('all pattern codes appear as selectable options in the dropdown', () => {
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
        { config: baseConfig },
      );
      const optionArray = wrapper.find(RoutePatternSelect).prop('optionArray');

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
        { config: baseConfig },
      );
      expect(wrapper.find('button.route-pattern-toggle')).to.have.lengthOf(1);
    });
  });

  describe('Empty patterns', () => {
    it('renders nothing when the route has no patterns', () => {
      const props = {
        ...baseProps,
        route: { shortName: '1', mode: 'BUS', gtfsId: 'ROUTE:1', patterns: [] },
      };
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig },
      );
      expect(wrapper.find('.route-pattern-select')).to.have.lengthOf(0);
      expect(wrapper.find(RoutePatternSelect)).to.have.lengthOf(0);
    });
  });

  describe('Single-direction route', () => {
    it('renders a non-swappable toggle button when there is only one pattern', () => {
      const props = {
        ...baseProps,
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
          ],
        },
      };
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig },
      );
      // Shows a toggle button but no dropdown
      expect(wrapper.find('button.route-pattern-toggle')).to.have.lengthOf(1);
      expect(wrapper.find(RoutePatternSelect)).to.have.lengthOf(0);
      // No swap icon is shown when there is no second direction
      expect(wrapper.find('.toggle-icon')).to.have.lengthOf(0);
    });

    it('clicking the button does nothing when there is only one pattern', () => {
      let callCount = 0;
      const props = {
        ...baseProps,
        onSelectChange: () => {
          callCount += 1;
        },
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
          ],
        },
      };
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig },
      );
      wrapper.find('button.route-pattern-toggle').simulate('click');
      expect(callCount).to.equal(0);
    });
  });

  describe('Two same-direction patterns', () => {
    it('renders a dropdown (not a toggle button) and places the second same-direction pattern in a special group', () => {
      // Two patterns with the same directionId: the first becomes the sole "main" route,
      // the second is promoted to the "special routes" group, which forces dropdown rendering.
      const props = {
        ...baseProps,
        route: {
          shortName: '1',
          mode: 'BUS',
          gtfsId: 'ROUTE:1',
          patterns: [
            makePattern('ROUTE:1:0:01', 0, 'Destination', [makeTripForDate()]),
            makePattern('ROUTE:1:0:02', 0, 'Via Downtown', [makeTripForDate()]),
          ],
        },
      };
      const wrapper = mountWithProviders(
        <RoutePatternSelectContainer {...props} />,
        { config: baseConfig },
      );
      expect(wrapper.find('button.route-pattern-toggle')).to.have.lengthOf(0);
      expect(wrapper.find(RoutePatternSelect)).to.have.lengthOf(1);

      const optionArray = wrapper.find(RoutePatternSelect).prop('optionArray');
      // First group: unnamed main route
      expect(optionArray[0].name).to.equal('');
      expect(optionArray[0].options).to.have.lengthOf(1);
      // Second group: special routes
      expect(optionArray[1].name).to.match(/other routes/i);
      expect(optionArray[1].options).to.have.lengthOf(1);
    });
  });

  describe('Redirect behaviour', () => {
    it('does not redirect when the current patternId already matches a valid option', () => {
      let replacedUrl;
      const matchWithSpy = {
        ...mockMatch,
        params: { patternId: 'ROUTE:1:0:01' }, // valid – matches a real pattern
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
        route: makeTwoDirectionRoute(),
      };
      mountWithProviders(<RoutePatternSelectContainer {...props} />, {
        config: baseConfig,
      });
      expect(replacedUrl).to.equal(undefined);
    });
  });
});

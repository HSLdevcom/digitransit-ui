import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import CanceledTripCard from '../../../../app/component/trafficnow/CanceledTripCard';
import CanceledDepartures from '../../../../app/component/trafficnow/components/CanceledDepartures';
import DisruptionStatus from '../../../../app/component/trafficnow/components/DisruptionStatus';
import RouteBadgeGroup from '../../../../app/component/trafficnow/components/RouteBadgeGroup';
import Icon from '../../../../app/component/Icon';

const makeTrip = ({
  shortName = '21B',
  gtfsId = 'HSL:21B',
  tripId = 'trip-1',
  departure = '2024-02-24T10:30:00',
  ...rest
} = {}) => ({
  start: { schedule: { time: { departure } } },
  trip: {
    tripId,
    route: { gtfsId, shortName },
    ...rest,
  },
});

const baseProps = {
  mode: 'bus',
  totalCount: 1,
  trips: [makeTrip()],
};

describe('<CanceledTripCard />', () => {
  describe('Grouping logic', () => {
    it('groups trips by route shortName', () => {
      const props = {
        ...baseProps,
        totalCount: 2,
        trips: [
          makeTrip({
            shortName: '21B',
            tripId: 'trip-1',
            departure: '2024-02-24T10:30:00',
          }),
          makeTrip({
            shortName: '21B',
            tripId: 'trip-2',
            departure: '2024-02-24T11:00:00',
          }),
        ],
      };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const badgeGroup = wrapper.find(RouteBadgeGroup);
      expect(badgeGroup).to.have.length(1);
      const routes = badgeGroup.prop('routes');
      expect(routes).to.have.length(1);
      expect(routes[0].id).to.equal('21B');
      expect(routes[0].trips).to.have.length(2);
    });

    it('groups trips from different routes into separate groups', () => {
      const props = {
        ...baseProps,
        totalCount: 2,
        trips: [
          makeTrip({ shortName: '21B', gtfsId: 'HSL:21B', tripId: 'trip-1' }),
          makeTrip({ shortName: '55', gtfsId: 'HSL:55', tripId: 'trip-2' }),
        ],
      };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');
      expect(routes).to.have.length(2);
    });

    it('uses "unknown" as shortName when route.shortName is missing', () => {
      const trip = {
        start: { schedule: { time: { departure: '2024-02-24T09:00:00' } } },
        trip: { tripId: 'x', route: { gtfsId: 'HSL:99' } },
      };
      const props = { ...baseProps, trips: [trip] };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');
      expect(routes[0].id).to.equal('unknown');
    });

    it('skips trips missing trip.route.gtfsId', () => {
      const invalidTrip = {
        start: { schedule: { time: { departure: '2024-02-24T10:00:00' } } },
        trip: { tripId: 'bad', route: {} },
      };
      const props = { ...baseProps, trips: [invalidTrip] };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');
      expect(routes).to.have.length(0);
    });

    it('skips trips missing start.schedule.time.departure', () => {
      const invalidTrip = {
        start: { schedule: { time: {} } },
        trip: { tripId: 'bad2', route: { gtfsId: 'HSL:1', shortName: '1' } },
      };
      const props = { ...baseProps, trips: [invalidTrip] };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');
      expect(routes).to.have.length(0);
    });

    it('formats departure time as HH:mm from ISO string', () => {
      const props = {
        ...baseProps,
        trips: [makeTrip({ departure: '2024-02-24T10:30:00' })],
      };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');
      expect(routes[0].trips[0].departureTime).to.equal('10:30');
    });
  });

  describe('Single-route rendering', () => {
    it('renders CanceledDepartures inline for a single route via renderRouteSuffix', () => {
      const props = { ...baseProps };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const badgeGroup = wrapper.find(RouteBadgeGroup);
      const renderRouteSuffix = badgeGroup.prop('renderRouteSuffix');
      // renderRouteSuffix returns a JSX element — check its type directly without re-wrapping
      const result = renderRouteSuffix({
        trips: [{ tripId: 'trip-1', departureTime: '10:30' }],
      });
      expect(result).to.not.equal(null);
      expect(result.type).to.equal(CanceledDepartures);
    });

    it('returns null from renderRouteSuffix when there are multiple routes', () => {
      const props = {
        mode: 'bus',
        totalCount: 2,
        trips: [
          makeTrip({ shortName: '21B', tripId: 'trip-1' }),
          makeTrip({ shortName: '55', tripId: 'trip-2' }),
        ],
      };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const renderRouteSuffix = wrapper
        .find(RouteBadgeGroup)
        .prop('renderRouteSuffix');
      const rendered = renderRouteSuffix({ trips: [] });
      expect(rendered).to.equal(null);
    });
  });

  describe('isMobile layout', () => {
    it('renders separator and DisruptionStatus in the header when isMobile=false', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} isMobile={false} />,
      );
      expect(wrapper.find('.separator.vertical')).to.have.lengthOf(1);
      expect(wrapper.find('header').find(DisruptionStatus)).to.have.lengthOf(1);
    });

    it('hides the header separator and moves DisruptionStatus below badges when isMobile=true', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} isMobile />,
      );
      expect(wrapper.find('.separator.vertical')).to.have.lengthOf(0);
      expect(wrapper.find('header').find(DisruptionStatus)).to.have.lengthOf(0);
      expect(wrapper.find(DisruptionStatus)).to.have.lengthOf(1);
    });
  });

  describe('Ellipsis (three-dots icon)', () => {
    it('renders the three-dots icon when totalCount > trips.length', () => {
      const props = {
        mode: 'bus',
        totalCount: 5,
        trips: [makeTrip()],
      };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const renderSuffix = wrapper.find(RouteBadgeGroup).prop('renderSuffix');
      const rendered = shallow(<div>{renderSuffix}</div>);
      expect(
        rendered.find(Icon).findWhere(n => n.prop('img') === 'icon_three-dots'),
      ).to.have.length(1);
    });

    it('does not render the three-dots icon when totalCount equals trips.length', () => {
      const props = { ...baseProps, totalCount: 1 };
      const wrapper = shallowWithIntl(<CanceledTripCard {...props} />);
      const renderSuffix = wrapper.find(RouteBadgeGroup).prop('renderSuffix');
      expect(renderSuffix).to.equal(null);
    });
  });
});

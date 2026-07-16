import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import { shallowWithIntl } from '../../helpers/mock-intl-enzyme';
import CanceledTripCard from '../../../../app/component/trafficnow/CanceledTripCard';
import Card from '../../../../app/component/Card';
import DisruptionStatus from '../../../../app/component/trafficnow/components/DisruptionStatus';
import RouteBadgeGroup from '../../../../app/component/trafficnow/components/RouteBadgeGroup';
import Icon from '../../../../app/component/Icon';

const makeRouteSummary = ({
  shortName = '21B',
  gtfsId = 'HSL:21B',
  id = 'route-21B',
  cancellationCount = 2,
  patterns = [
    {
      cancellationCount: 2,
      pattern: {
        code: 'pattern-21B',
        headsign: 'Kamppi',
      },
    },
  ],
} = {}) => ({
  cancellationCount,
  route: {
    shortName,
    gtfsId,
    id,
    mode: 'BUS',
  },
  patterns,
});

const makeRoutes = amount =>
  new Array(amount).fill(null).map((_, i) =>
    makeRouteSummary({
      shortName: `${20 + i}`,
      gtfsId: `HSL:${20 + i}`,
      id: `route-${20 + i}`,
    }),
  );

const baseProps = {
  mode: 'bus',
  routes: [makeRouteSummary()],
};

describe('<CanceledTripCard />', () => {
  describe('RouteBadgeGroup props', () => {
    it('maps canceled route summaries to route badges', () => {
      const wrapper = shallowWithIntl(<CanceledTripCard {...baseProps} />);
      const badgeGroup = wrapper.find(RouteBadgeGroup);

      expect(badgeGroup).to.have.lengthOf(1);
      expect(badgeGroup.prop('mode')).to.equal('bus');
      expect(badgeGroup.prop('stopPropagation')).to.equal(true);
      expect(badgeGroup.prop('routes')).to.deep.equal([
        {
          name: '21B',
          gtfsId: 'HSL:21B',
          id: 'route-21B',
          url: '/linjat/HSL%3A21B',
        },
      ]);
    });

    it('renders at most five route badges', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} routes={makeRoutes(6)} />,
      );
      const routes = wrapper.find(RouteBadgeGroup).prop('routes');

      expect(routes).to.have.lengthOf(5);
      expect(routes.map(route => route.name)).to.deep.equal([
        '20',
        '21',
        '22',
        '23',
        '24',
      ]);
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
    it('renders the three-dots icon when there are more routes than visible badges', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} routes={makeRoutes(6)} />,
      );
      const renderSuffix = wrapper.find(RouteBadgeGroup).prop('renderSuffix');
      const rendered = shallow(<div>{renderSuffix}</div>);

      expect(
        rendered.find(Icon).findWhere(n => n.prop('img') === 'icon_three-dots'),
      ).to.have.lengthOf(1);
    });

    it('does not render the three-dots icon when all routes are visible', () => {
      const wrapper = shallowWithIntl(
        <CanceledTripCard {...baseProps} routes={makeRoutes(5)} />,
      );

      expect(wrapper.find(RouteBadgeGroup).prop('renderSuffix')).to.equal(null);
    });
  });

  describe('Navigation', () => {
    it('navigates to the canceled trips detail view for the mode when the card is clicked', () => {
      const router = { push: sinon.spy() };
      const wrapper = shallowWithIntl(<CanceledTripCard {...baseProps} />, {
        router,
      });
      const event = {
        preventDefault: () => {},
        stopPropagation: () => {},
      };

      wrapper.find(Card).prop('onClick')(event);

      expect(router.push.calledWith('/liikenne/peruutukset/bus')).to.equal(
        true,
      );
    });
  });
});

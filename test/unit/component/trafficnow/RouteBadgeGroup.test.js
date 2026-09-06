import React from 'react';
import { shallow } from 'enzyme';
import * as found from 'found';
import { Component as RouteBadgeGroup } from '../../../../app/component/trafficnow/components/RouteBadgeGroup';
import Icon from '../../../../app/component/Icon';
import EntityBadge from '../../../../app/component/trafficnow/components/EntityBadge';

const makeRoute = ({
  id = 'HSL:1',
  name = '1',
  url = '/route/HSL:1',
  gtfsId = 'HSL:1',
} = {}) => ({ id, name, url, gtfsId });

describe('<RouteBadgeGroup />', () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = { push: vi.fn() };
    vi.spyOn(found, 'useRouter').mockReturnValue({ router: mockRouter });
  });

  describe('Mode icon', () => {
    it('renders at normal iconScale (1) when isStop=false', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop={false} />,
      );
      expect(wrapper.find(Icon).first().prop('iconScale')).toBe(1);
    });

    it('renders at half iconScale (0.5) when isStop=true', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop />,
      );
      expect(wrapper.find(Icon).first().prop('iconScale')).toBe(0.5);
    });

    it('passes a background element when isStop=true', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop />,
      );
      const bg = wrapper.find(Icon).first().prop('background');
      expect(bg).not.toBe(false);
      expect(bg).not.toBe(null);
    });

    it('passes background=false when isStop=false', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop={false} />,
      );
      expect(wrapper.find(Icon).first().prop('background')).toBe(false);
    });
  });

  describe('Route link rendering', () => {
    it('applies the highlight class when gtfsId matches highlightedGtfsId', () => {
      const wrapper = shallow(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute({ gtfsId: 'HSL:1' })]}
          highlightedGtfsId="HSL:1"
        />,
      );
      expect(wrapper.find(EntityBadge).prop('highlighted')).toBe(true);
    });

    it('does not apply the highlight class when gtfsId does not match', () => {
      const wrapper = shallow(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute({ gtfsId: 'HSL:1' })]}
          highlightedGtfsId="HSL:99"
        />,
      );
      expect(wrapper.find(EntityBadge).prop('highlighted')).toBe(false);
    });
  });

  describe('Click handler', () => {
    it('calls router.push with the route url when a link is clicked', () => {
      const wrapper = shallow(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute({ url: '/route/HSL:1' })]}
        />,
      );
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };
      wrapper.find(EntityBadge).prop('handleClick')('/route/HSL:1')(mockEvent);
      expect(mockRouter.push).toHaveBeenCalledWith('/route/HSL:1');
    });

    it('calls event.stopPropagation when stopPropagation=true', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} stopPropagation />,
      );
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };
      wrapper.find(EntityBadge).prop('handleClick')('/route/HSL:1')(mockEvent);
      expect(mockEvent.stopPropagation).toHaveBeenCalledOnce();
    });

    it('does NOT call event.stopPropagation when stopPropagation=false', () => {
      const wrapper = shallow(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute()]}
          stopPropagation={false}
        />,
      );
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      };
      wrapper.find(EntityBadge).prop('handleClick')('/route/HSL:1')(mockEvent);
      expect(mockEvent.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('renderRouteSuffix', () => {
    it('renders routes in plain Fragments when renderRouteSuffix is null', () => {
      const wrapper = shallow(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute()]}
          renderRouteSuffix={null}
        />,
      );
      expect(wrapper.find('.badges__headsign-group--route')).toHaveLength(0);
    });

    it('renders the suffix node returned by renderRouteSuffix for the given route', () => {
      const route = makeRoute({
        id: 'r1',
        name: '21B',
        url: '/route/r1',
        gtfsId: 'HSL:r1',
      });
      const wrapper = shallow(
        <RouteBadgeGroup
          mode="bus"
          routes={[route]}
          renderRouteSuffix={r => <span className={`suffix-${r.id}`} />}
        />,
      );
      expect(wrapper.find('.suffix-r1')).toHaveLength(1);
    });
  });
});

import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import * as found from 'found';
import RouteBadgeGroup from '../../../../app/component/trafficnow/components/RouteBadgeGroup';
import Icon from '../../../../app/component/Icon';

const makeRoute = ({
  id = 'HSL:1',
  name = '1',
  url = '/route/HSL:1',
  gtfsId = 'HSL:1',
} = {}) => ({ id, name, url, gtfsId });

describe('<RouteBadgeGroup />', () => {
  let sandbox;
  let mockRouter;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    mockRouter = { push: sandbox.spy() };
    sandbox.stub(found, 'useRouter').returns({ router: mockRouter });
  });

  afterEach(() => sandbox.restore());

  describe('Mode icon', () => {
    it('renders at normal iconScale (1) when isStop=false', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop={false} />,
      );
      expect(wrapper.find(Icon).first().prop('iconScale')).to.equal(1);
    });

    it('renders at half iconScale (0.5) when isStop=true', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop />,
      );
      expect(wrapper.find(Icon).first().prop('iconScale')).to.equal(0.5);
    });

    it('passes a background element when isStop=true', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop />,
      );
      const bg = wrapper.find(Icon).first().prop('background');
      expect(bg).to.not.equal(false);
      expect(bg).to.not.equal(null);
    });

    it('passes background=false when isStop=false', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop={false} />,
      );
      expect(wrapper.find(Icon).first().prop('background')).to.equal(false);
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
      expect(wrapper.find('a').hasClass('highlight')).to.equal(true);
    });

    it('does not apply the highlight class when gtfsId does not match', () => {
      const wrapper = shallow(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute({ gtfsId: 'HSL:1' })]}
          highlightedGtfsId="HSL:99"
        />,
      );
      expect(wrapper.find('a').hasClass('highlight')).to.equal(false);
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
        preventDefault: sinon.spy(),
        stopPropagation: sinon.spy(),
      };
      wrapper.find('a').prop('onClick')(mockEvent);
      expect(mockRouter.push.calledWith('/route/HSL:1')).to.equal(true);
    });

    it('calls event.stopPropagation when stopPropagation=true', () => {
      const wrapper = shallow(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} stopPropagation />,
      );
      const mockEvent = {
        preventDefault: sinon.spy(),
        stopPropagation: sinon.spy(),
      };
      wrapper.find('a').prop('onClick')(mockEvent);
      expect(mockEvent.stopPropagation.calledOnce).to.equal(true);
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
        preventDefault: sinon.spy(),
        stopPropagation: sinon.spy(),
      };
      wrapper.find('a').prop('onClick')(mockEvent);
      expect(mockEvent.stopPropagation.called).to.equal(false);
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
      expect(wrapper.find('.badges__headsign-group--route')).to.have.lengthOf(
        0,
      );
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
      expect(wrapper.find('.suffix-r1')).to.have.lengthOf(1);
    });
  });
});

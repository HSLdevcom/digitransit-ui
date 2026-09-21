import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import sinon from 'sinon';
import * as found from 'found';
import RouteBadgeGroup from '../../../../app/component/trafficnow/components/RouteBadgeGroup';

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
      const { container } = render(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop={false} />,
      );
      const g = container.querySelector('svg.icon g');
      expect(g.style.transform).to.equal('scale(1)');
    });

    it('renders at half iconScale (0.5) when isStop=true', () => {
      const { container } = render(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop />,
      );
      const g = container.querySelector('svg.icon g');
      expect(g.style.transform).to.equal('scale(0.5)');
    });

    it('renders a background (.icon-circle) when isStop=true', () => {
      const { container } = render(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop />,
      );
      expect(container.querySelector('svg.icon .icon-circle')).to.not.equal(
        null,
      );
    });

    it('renders no background when isStop=false', () => {
      const { container } = render(
        <RouteBadgeGroup mode="bus" routes={[makeRoute()]} isStop={false} />,
      );
      expect(container.querySelector('svg.icon .icon-circle')).to.equal(null);
    });
  });

  describe('Route link rendering', () => {
    it('applies the highlight class when gtfsId matches highlightedGtfsId', () => {
      const { container } = render(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute({ gtfsId: 'HSL:1' })]}
          highlightedGtfsId="HSL:1"
        />,
      );
      expect(container.querySelector('a.highlight')).to.not.equal(null);
    });

    it('does not apply the highlight class when gtfsId does not match', () => {
      const { container } = render(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute({ gtfsId: 'HSL:1' })]}
          highlightedGtfsId="HSL:99"
        />,
      );
      expect(container.querySelector('a.highlight')).to.equal(null);
    });
  });

  describe('Click handler', () => {
    it('calls router.push with the route url when a link is clicked', () => {
      const { container } = render(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute({ url: '/route/HSL:1' })]}
        />,
      );
      fireEvent.click(container.querySelector('a'));
      expect(mockRouter.push.calledWith('/route/HSL:1')).to.equal(true);
    });

    it('calls event.stopPropagation when stopPropagation=true', () => {
      const outerClickSpy = sinon.spy();
      const { container } = render(
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div onClick={outerClickSpy}>
          <RouteBadgeGroup mode="bus" routes={[makeRoute()]} stopPropagation />
        </div>,
      );
      fireEvent.click(container.querySelector('a'));
      expect(outerClickSpy.called).to.equal(false);
    });

    it('does NOT call event.stopPropagation when stopPropagation=false', () => {
      const outerClickSpy = sinon.spy();
      const { container } = render(
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
        <div onClick={outerClickSpy}>
          <RouteBadgeGroup
            mode="bus"
            routes={[makeRoute()]}
            stopPropagation={false}
          />
        </div>,
      );
      fireEvent.click(container.querySelector('a'));
      expect(outerClickSpy.called).to.equal(true);
    });
  });

  describe('renderRouteSuffix', () => {
    it('renders routes in plain Fragments when renderRouteSuffix is null', () => {
      const { container } = render(
        <RouteBadgeGroup
          mode="bus"
          routes={[makeRoute()]}
          renderRouteSuffix={null}
        />,
      );
      expect(
        container.querySelectorAll('.badges__headsign-group--route'),
      ).to.have.lengthOf(0);
    });

    it('renders the suffix node returned by renderRouteSuffix for the given route', () => {
      const route = makeRoute({
        id: 'r1',
        name: '21B',
        url: '/route/r1',
        gtfsId: 'HSL:r1',
      });
      const { container } = render(
        <RouteBadgeGroup
          mode="bus"
          routes={[route]}
          renderRouteSuffix={r => <span className={`suffix-${r.id}`} />}
        />,
      );
      expect(container.querySelectorAll('.suffix-r1')).to.have.lengthOf(1);
    });
  });
});

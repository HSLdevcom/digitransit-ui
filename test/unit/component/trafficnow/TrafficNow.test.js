import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import * as found from 'found';
import { createShallowHookSandbox } from '../../helpers/mock-intl-enzyme';
import TrafficNow from '../../../../app/component/trafficnow/TrafficNow';
import TrafficNowHeader from '../../../../app/component/trafficnow/TrafficNowHeader';
import Filters from '../../../../app/component/trafficnow/filters/Filters';
import Disruptions from '../../../../app/component/trafficnow/Disruptions';
import CanceledTripsContainer from '../../../../app/component/trafficnow/CanceledTripsContainer';
import DisruptionDetailsContainer from '../../../../app/component/trafficnow/DisruptionDetailsContainer';
import * as withBreakpoint from '../../../../app/util/withBreakpoint';

const baseConfig = {
  CONFIG: 'default',
  colors: { primary: '#007ac9' },
};

/**
 * Creates the shared sandbox with useIntl and useConfigContext stubs,
 * then adds stubs for useBreakpoint and useRouter.
 */
function createSandbox({
  breakpoint = 'large',
  mode = undefined,
  alertId = undefined,
} = {}) {
  const { sandbox, stubs } = createShallowHookSandbox({ config: baseConfig });
  sandbox.stub(withBreakpoint, 'useBreakpoint').returns(breakpoint);
  sandbox.stub(found, 'useRouter').returns({
    match: { params: { mode, alertId } },
  });
  return { sandbox, stubs };
}

describe('<TrafficNow />', () => {
  let sandbox;

  afterEach(() => sandbox.restore());

  describe('Desktop layout — no mode param', () => {
    beforeEach(() => {
      ({ sandbox } = createSandbox({ breakpoint: 'large', mode: undefined }));
    });

    it('renders the TrafficNowHeader', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(TrafficNowHeader)).to.have.lengthOf(1);
    });

    it('renders the desktop Filters panel inside .traffic-now__filters-container', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find('.traffic-now__filters-container')).to.have.lengthOf(
        1,
      );
      expect(
        wrapper.find('.traffic-now__filters-container').find(Filters),
      ).to.have.lengthOf(1);
    });

    it('renders Disruptions', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(Disruptions)).to.have.lengthOf(1);
    });

    it('does NOT render the mobile filters button container', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(
        wrapper.find('.traffic-now__filters-button-container'),
      ).to.have.lengthOf(0);
    });

    it('does NOT apply the mobile body modifier class', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find('.traffic-now__body--mobile')).to.have.lengthOf(0);
    });
  });

  describe('Mobile layout — no mode param', () => {
    beforeEach(() => {
      ({ sandbox } = createSandbox({ breakpoint: 'small', mode: undefined }));
    });

    it('renders the TrafficNowHeader', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(TrafficNowHeader)).to.have.lengthOf(1);
    });

    it('renders the mobile filters button container instead of the desktop Filters panel', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(
        wrapper.find('.traffic-now__filters-button-container'),
      ).to.have.lengthOf(1);
      expect(wrapper.find('.traffic-now__filters-container')).to.have.lengthOf(
        0,
      );
    });

    it('renders Disruptions', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(Disruptions)).to.have.lengthOf(1);
    });

    it('applies the mobile body modifier class', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find('.traffic-now__body--mobile')).to.have.lengthOf(1);
    });
  });

  describe('Desktop layout — with mode param', () => {
    beforeEach(() => {
      ({ sandbox } = createSandbox({ breakpoint: 'large', mode: 'CANCELED' }));
    });

    it('shows the TrafficNowHeader (not a mobile canceled-trips view on desktop)', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(TrafficNowHeader)).to.have.lengthOf(1);
    });

    it('renders CanceledTripsContainer with the correct mode prop', () => {
      const wrapper = shallow(<TrafficNow />);
      const container = wrapper.find(CanceledTripsContainer);
      expect(container).to.have.lengthOf(1);
      expect(container.prop('mode')).to.equal('CANCELED');
    });

    it('passes isMobile=false to CanceledTripsContainer on desktop', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(CanceledTripsContainer).prop('isMobile')).to.equal(
        false,
      );
    });

    it('does NOT render Disruptions', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(Disruptions)).to.have.lengthOf(0);
    });
  });

  describe('Mobile layout — with mode param (isMobileCanceledTripsView)', () => {
    beforeEach(() => {
      ({ sandbox } = createSandbox({ breakpoint: 'medium', mode: 'CANCELED' }));
    });

    it('hides the TrafficNowHeader', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(TrafficNowHeader)).to.have.lengthOf(0);
    });

    it('hides the separator', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find('.separator.horizontal')).to.have.lengthOf(0);
    });

    it('renders CanceledTripsContainer with the correct mode prop', () => {
      const wrapper = shallow(<TrafficNow />);
      const container = wrapper.find(CanceledTripsContainer);
      expect(container).to.have.lengthOf(1);
      expect(container.prop('mode')).to.equal('CANCELED');
    });

    it('passes isMobile=true to CanceledTripsContainer', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(CanceledTripsContainer).prop('isMobile')).to.equal(
        true,
      );
    });

    it('applies the mobile body modifier class', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find('.traffic-now__body--mobile')).to.have.lengthOf(1);
    });
  });

  describe('Desktop layout — with alertId param (details view)', () => {
    beforeEach(() => {
      ({ sandbox } = createSandbox({
        breakpoint: 'large',
        alertId: 'alert-1',
      }));
    });

    it('renders the TrafficNowHeader', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(TrafficNowHeader)).to.have.lengthOf(1);
    });

    it('renders DisruptionDetailsContainer with the correct alertId', () => {
      const wrapper = shallow(<TrafficNow />);
      const container = wrapper.find(DisruptionDetailsContainer);
      expect(container).to.have.lengthOf(1);
      expect(container.prop('alertId')).to.equal('alert-1');
    });

    it('passes isMobile=false to DisruptionDetailsContainer on desktop', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(
        wrapper.find(DisruptionDetailsContainer).prop('isMobile'),
      ).to.equal(false);
    });

    it('does NOT render Disruptions', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(Disruptions)).to.have.lengthOf(0);
    });

    it('does NOT render CanceledTripsContainer', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(CanceledTripsContainer)).to.have.lengthOf(0);
    });
  });

  describe('Mobile layout — with alertId param (details view)', () => {
    beforeEach(() => {
      ({ sandbox } = createSandbox({
        breakpoint: 'medium',
        alertId: 'alert-1',
      }));
    });

    it('hides the TrafficNowHeader', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find(TrafficNowHeader)).to.have.lengthOf(0);
    });

    it('renders DisruptionDetailsContainer with the correct alertId', () => {
      const wrapper = shallow(<TrafficNow />);
      const container = wrapper.find(DisruptionDetailsContainer);
      expect(container).to.have.lengthOf(1);
      expect(container.prop('alertId')).to.equal('alert-1');
    });

    it('passes isMobile=true to DisruptionDetailsContainer on mobile', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(
        wrapper.find(DisruptionDetailsContainer).prop('isMobile'),
      ).to.equal(true);
    });

    it('applies the mobile body modifier class', () => {
      const wrapper = shallow(<TrafficNow />);
      expect(wrapper.find('.traffic-now__body--mobile')).to.have.lengthOf(1);
    });
  });
});

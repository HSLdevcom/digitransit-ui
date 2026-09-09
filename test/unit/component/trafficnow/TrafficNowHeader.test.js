import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import { createShallowHookSandbox } from '../../helpers/mock-intl-enzyme';
import TrafficNowHeader from '../../../../app/component/trafficnow/TrafficNowHeader';
import * as withBreakpoint from '../../../../app/util/withBreakpoint';
import * as useLogo from '../../../../app/hooks/useLogo';

const baseConfig = {
  CONFIG: 'default',
  trafficNowHeaderGraphic: null,
  colors: { primary: '#007ac9' },
  URL: {},
  language: 'fi',
};

describe('<TrafficNowHeader />', () => {
  let sandbox;
  let stubs;

  beforeEach(() => {
    ({ sandbox, stubs } = createShallowHookSandbox({ config: baseConfig }));
    sandbox.stub(withBreakpoint, 'useBreakpoint').returns('large');
    sandbox.stub(useLogo, 'useLogo').returns({ logo: null, loading: false });
  });

  afterEach(() => sandbox.restore());

  describe('Desktop vs mobile class', () => {
    it('does not apply --mobile modifier on large breakpoint', () => {
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.hasClass('traffic-now__header--mobile')).to.equal(false);
    });

    it('applies --mobile modifier on small breakpoint', () => {
      withBreakpoint.useBreakpoint.returns('small');
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.hasClass('traffic-now__header--mobile')).to.equal(true);
    });
  });

  describe('Header logo image', () => {
    it('renders the logo <img> on desktop when a logo URL is returned by useLogo', () => {
      useLogo.useLogo.returns({ logo: '/path/to/header.svg', loading: false });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('img')).to.have.lengthOf(1);
    });

    it('does not render the logo <img> on mobile even when a logo is available', () => {
      withBreakpoint.useBreakpoint.returns('small');
      useLogo.useLogo.returns({ logo: '/path/to/header.svg', loading: false });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('img')).to.have.lengthOf(0);
    });

    it('does not render the logo <img> on desktop when no logo is available', () => {
      useLogo.useLogo.returns({ logo: null, loading: false });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('img')).to.have.lengthOf(0);
    });
  });

  describe('Breadcrumb link', () => {
    it('links to "/" when trafficNowRootPath is not defined', () => {
      const wrapper = shallow(<TrafficNowHeader />);
      const breadcrumb = wrapper.find('.traffic-now__header-breadcrumb Link');
      expect(breadcrumb).to.have.lengthOf(1);
      expect(breadcrumb.prop('to')).to.equal('/');
    });

    it('links to ROOTLINK + trafficNowRootPath when defined', () => {
      stubs.useConfigContext.returns({
        ...baseConfig,
        CONFIG: 'hsl',
        trafficNowRootPath: {
          fi: '/matkustaminen',
          sv: '/sv/att-resa',
          en: '/en/travelling',
        },
        URL: { ROOTLINK: 'https://www.hsl.fi' },
      });
      const wrapper = shallow(<TrafficNowHeader />);
      const breadcrumb = wrapper.find('.traffic-now__header-breadcrumb a');
      expect(breadcrumb).to.have.lengthOf(1);
      expect(breadcrumb.prop('href')).to.equal(
        'https://www.hsl.fi/matkustaminen',
      );
    });

    it('links using the localized path for the current language', () => {
      stubs.useConfigContext.returns({
        ...baseConfig,
        CONFIG: 'hsl',
        language: 'sv',
        trafficNowRootPath: {
          fi: '/matkustaminen',
          sv: '/sv/att-resa',
          en: '/en/travelling',
        },
        URL: { ROOTLINK: 'https://www.hsl.fi' },
      });
      const wrapper = shallow(<TrafficNowHeader />);
      const breadcrumb = wrapper.find('.traffic-now__header-breadcrumb a');
      expect(breadcrumb).to.have.lengthOf(1);
      expect(breadcrumb.prop('href')).to.equal(
        'https://www.hsl.fi/sv/att-resa',
      );
    });
  });

  describe('HSL-specific AdditionalDescription', () => {
    it('renders AdditionalDescription when CONFIG is hsl', () => {
      stubs.useConfigContext.returns({ ...baseConfig, CONFIG: 'hsl' });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('AdditionalDescription')).to.have.lengthOf(1);
    });

    it('does not render AdditionalDescription when CONFIG is not hsl', () => {
      stubs.useConfigContext.returns({ ...baseConfig, CONFIG: 'default' });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('AdditionalDescription')).to.have.lengthOf(0);
    });
  });
});

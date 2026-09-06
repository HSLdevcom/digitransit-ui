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
  let stubs;

  beforeEach(() => {
    ({ stubs } = createShallowHookSandbox({ config: baseConfig }));
    vi.spyOn(withBreakpoint, 'useBreakpoint').mockReturnValue('large');
    vi.spyOn(useLogo, 'useLogo').mockReturnValue({
      logo: null,
      loading: false,
    });
  });

  describe('Desktop vs mobile class', () => {
    it('does not apply --mobile modifier on large breakpoint', () => {
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.hasClass('traffic-now__header--mobile')).toBe(false);
    });

    it('applies --mobile modifier on small breakpoint', () => {
      withBreakpoint.useBreakpoint.mockReturnValue('small');
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.hasClass('traffic-now__header--mobile')).toBe(true);
    });
  });

  describe('Header logo image', () => {
    it('renders the logo <img> on desktop when a logo URL is returned by useLogo', () => {
      useLogo.useLogo.mockReturnValue({
        logo: '/path/to/header.svg',
        loading: false,
      });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('img')).toHaveLength(1);
    });

    it('does not render the logo <img> on mobile even when a logo is available', () => {
      withBreakpoint.useBreakpoint.mockReturnValue('small');
      useLogo.useLogo.mockReturnValue({
        logo: '/path/to/header.svg',
        loading: false,
      });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('img')).toHaveLength(0);
    });

    it('does not render the logo <img> on desktop when no logo is available', () => {
      useLogo.useLogo.mockReturnValue({ logo: null, loading: false });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('img')).toHaveLength(0);
    });
  });

  describe('HSL-specific AdditionalDescription', () => {
    it('renders AdditionalDescription when CONFIG is hsl', () => {
      stubs.useConfigContext.mockReturnValue({ ...baseConfig, CONFIG: 'hsl' });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('AdditionalDescription')).toHaveLength(1);
    });

    it('does not render AdditionalDescription when CONFIG is not hsl', () => {
      stubs.useConfigContext.mockReturnValue({
        ...baseConfig,
        CONFIG: 'default',
      });
      const wrapper = shallow(<TrafficNowHeader />);
      expect(wrapper.find('AdditionalDescription')).toHaveLength(0);
    });
  });
});

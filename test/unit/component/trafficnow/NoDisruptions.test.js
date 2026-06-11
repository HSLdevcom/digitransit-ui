import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import React from 'react';
import { shallow } from 'enzyme';
import { createShallowHookSandbox } from '../../helpers/mock-intl-enzyme';
import NoDisruptions from '../../../../app/component/trafficnow/components/NoDisruptions';
import Icon from '../../../../app/component/Icon';
import * as useLogo from '../../../../app/hooks/useLogo';

const baseConfig = {
  CONFIG: 'default',
  notFoundGraphic: null,
  colors: { primary: '#007ac9' },
};

describe('<NoDisruptions />', () => {
  let sandbox;
  let stubs;

  beforeEach(() => {
    ({ sandbox, stubs } = createShallowHookSandbox({ config: baseConfig }));
    // useLogo is not stubbed by createShallowHookSandbox; add it here.
    sandbox.stub(useLogo, 'useLogo').returns({ logo: null, loading: false });
  });

  afterEach(() => sandbox.restore());

  describe('Graphic rendering', () => {
    it('renders the fallback Icon when no logo is available', () => {
      // useLogo already stubbed to return { logo: null } in beforeEach
      const wrapper = shallow(<NoDisruptions />);
      expect(wrapper.find(Icon)).to.have.lengthOf(1);
      expect(wrapper.find('img')).to.have.lengthOf(0);
    });

    it('renders an img tag when a logo URL is available', () => {
      stubs.useConfigContext.returns({
        ...baseConfig,
        notFoundGraphic: 'some-graphic.svg',
      });
      useLogo.useLogo.returns({
        logo: '/path/to/some-graphic.svg',
        loading: false,
      });

      const wrapper = shallow(<NoDisruptions />);
      expect(wrapper.find('img')).to.have.lengthOf(1);
      expect(wrapper.find(Icon)).to.have.lengthOf(0);
    });
  });
});

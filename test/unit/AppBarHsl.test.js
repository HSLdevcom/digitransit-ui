import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';

import AppBarHsl from '../../app/component/AppBarHsl';

describe('<AppBarHsl />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<AppBarHsl />, {
      context: {
        match: {
          location: {
            pathname: '/',
          },
        },
        config: {
          allowLogin: false,
          URL: {
            ROOTLINK: 'http://www.foo.com',
          },
        },
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
  });

  it.skip("language should be 'fi'", () => {
    const props = {
      lang: 'fi',
    };
    const wrapper = shallowWithIntl(<AppBarHsl {...props} />, {
      context: {
        match: {
          location: {
            pathname: '/',
          },
        },
      },
    });
    expect(wrapper.name()).to.equal('ForwardRef');
    expect(wrapper.prop('searchPage')).to.equal('https://uusi.hsl.fi/haku');
  });

  /* it("language should be 'sv'", () => {
    const props = {
      lang: 'sv',
    };
    const wrapper = shallowWithIntl(<AppBarHsl {...props} />, {
      context: {
        match: {
          location: {
            pathname: '/',
          },
        },
      },
    });
    expect(wrapper.name()).to.equal('ForwardRef');
    expect(wrapper.prop('searchPage')).to.equal(
      '/https://www.uusi.hsl.fi/sv/search/solr',
    );
  });

  it("language should be 'en'", () => {
    const props = {
      lang: 'en',
    };
    const wrapper = shallowWithIntl(<AppBarHsl {...props} />, {
      context: {
        match: {
          location: {
            pathname: '/',
          },
        },
      },
    });
    expect(wrapper.name()).to.equal('ForwardRef');
    expect(wrapper.prop('searchPage')).to.equal(
      'https://www.uusi.hsl.fi/en/search/solr',
    );
    );
  });
  */
});

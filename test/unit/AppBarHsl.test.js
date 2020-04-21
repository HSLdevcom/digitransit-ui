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
      },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
  });

  it("language should be 'fi'", () => {
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
    expect(wrapper.name()).to.equal('SiteHeader');
    expect(wrapper.prop('searchPage')).to.equal('/haku/');
    expect(wrapper.prop('searchPage')).to.not.equal('/sok/');
    expect(wrapper.prop('searchPage')).to.not.equal('/search/');
  });

  it("language should be 'sv'", () => {
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
    expect(wrapper.name()).to.equal('SiteHeader');
    expect(wrapper.prop('searchPage')).to.not.equal('/haku/');
    expect(wrapper.prop('searchPage')).to.equal('/sok/');
    expect(wrapper.prop('searchPage')).to.not.equal('/search/');
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
    expect(wrapper.name()).to.equal('SiteHeader');
    expect(wrapper.prop('searchPage')).to.not.equal('/haku/');
    expect(wrapper.prop('searchPage')).to.not.equal('/sok/');
    expect(wrapper.prop('searchPage')).to.equal('/search/');
  });
});

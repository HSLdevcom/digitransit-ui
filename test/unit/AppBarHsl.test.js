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
    expect(wrapper.prop('searchPage')).to.equal(
      'https://www.hsl.fi/search/solr',
    );
    expect(wrapper.prop('searchPage')).to.not.equal(
      '/https://www.hsl.fi/sv/search/solr',
    );
    expect(wrapper.prop('searchPage')).to.not.equal(
      'https://www.hsl.fi/en/search/solr',
    );
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
    expect(wrapper.prop('searchPage')).to.not.equal(
      'https://www.hsl.fi/search/solr',
    );
    expect(wrapper.prop('searchPage')).to.equal(
      '/https://www.hsl.fi/sv/search/solr',
    );
    expect(wrapper.prop('searchPage')).to.not.equal(
      'https://www.hsl.fi/en/search/solr',
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
    expect(wrapper.name()).to.equal('SiteHeader');
    expect(wrapper.prop('searchPage')).to.not.equal(
      'https://www.hsl.fi/search/solr',
    );
    expect(wrapper.prop('searchPage')).to.not.equal(
      '/https://www.hsl.fi/sv/search/solr',
    );
    expect(wrapper.prop('searchPage')).to.equal(
      'https://www.hsl.fi/en/search/solr',
    );
  });
});

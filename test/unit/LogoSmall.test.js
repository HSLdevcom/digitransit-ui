import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import LogoSmall from '../../app/component/LogoSmall';

describe('<LogoSmall />', () => {
  it('should show logo image', () => {
    const wrapper = shallowWithIntl(<LogoSmall logo="/" showLogo />, {
      context: {
        config: {
          textLogo: false,
        },
      },
    });

    expect(wrapper.find('span.title')).to.have.lengthOf(0);
    expect(wrapper.find('div.logo')).to.have.lengthOf(1);
  });

  it('should always show text logo when textLogo is true', () => {
    const wrapper = shallowWithIntl(<LogoSmall showLogo />, {
      context: {
        config: {
          textLogo: true,
        },
      },
    });

    expect(wrapper.find('span.title')).to.have.lengthOf(1);
    expect(wrapper.find('div.logo')).to.have.lengthOf(0);
  });

  it('should always show text logo when showLogo is false', () => {
    const wrapper = shallowWithIntl(<LogoSmall showLogo={false} />, {
      context: {
        config: {
          textLogo: false,
        },
      },
    });

    expect(wrapper.find('span.title')).to.have.lengthOf(1);
    expect(wrapper.find('div.logo')).to.have.lengthOf(0);
  });

  it('should show the given title text', () => {
    const wrapper = shallowWithIntl(
      <LogoSmall showLogo={false} title="Reittiopas" />,
      {
        context: {
          config: {
            textLogo: true,
          },
        },
      },
    );

    const titleElement = wrapper.find('span.title');
    expect(titleElement).to.have.lengthOf(1);
    expect(titleElement.text()).to.equal('Reittiopas');
    expect(wrapper.find('div.logo')).to.have.lengthOf(0);
  });

  it('should show the title with the logo', () => {
    const wrapper = shallowWithIntl(
      <LogoSmall showLogo showTitles title="foo" />,
      {
        context: {
          config: {
            textLogo: false,
          },
        },
      },
    );

    expect(wrapper.find('.logo-title').text()).to.equal('foo');
    expect(wrapper.find('.logo-sub-title')).to.have.lengthOf(0);
  });

  it('should show the sub title with the logo', () => {
    const wrapper = shallowWithIntl(
      <LogoSmall showLogo showTitles subTitle="bar" />,
      {
        context: {
          config: {
            textLogo: false,
          },
        },
      },
    );

    expect(wrapper.find('.logo-title')).to.have.lengthOf(0);
    expect(wrapper.find('.logo-sub-title').text()).to.equal('bar');
  });

  it('should not show the title or sub title with the logo', () => {
    const wrapper = shallowWithIntl(
      <LogoSmall showLogo title="foo" subTitle="bar" />,
      {
        context: {
          config: {
            textLogo: false,
          },
        },
      },
    );

    expect(wrapper.find('.logo-title')).to.have.lengthOf(0);
    expect(wrapper.find('.logo-sub-title')).to.have.lengthOf(0);
  });
});

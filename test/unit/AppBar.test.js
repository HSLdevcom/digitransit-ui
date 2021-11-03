import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';

import AppBar from '../../app/component/AppBar';
import LogoSmall from '../../app/component/LogoSmall';

describe('<AppBar />', () => {
  it('should show logo component with right props', () => {
    const wrapper = shallowWithIntl(
      <AppBar titleClicked={() => {}} logo="/" homeUrl="/" showLogo />,
      {
        context: {
          config: {
            textLogo: false,
            URL: {
              HEADER_TITLE: 'bbnavi',
            },
          },
          match: {
            location: {
              pathname: '/',
            },
          },
        },
      },
    );

    expect(wrapper.find(LogoSmall)).to.have.lengthOf(1);
    expect(wrapper.find(LogoSmall).props().showLogo).to.equal(true);
    expect(wrapper.find(LogoSmall).props().logo).to.equal('/');
  });

  it('should show text logo when textLogo is true', () => {
    const wrapper = shallowWithIntl(
      <AppBar titleClicked={() => {}} logo="/" homeUrl="/" />,
      {
        context: {
          config: {
            textLogo: true,
            URL: {
              HEADER_TITLE: 'bbnavi',
            },
          },
          match: {
            location: {
              pathname: '/',
            },
          },
        },
      },
    );

    expect(wrapper.find('section.title.title')).to.have.lengthOf(1);
    expect(wrapper.find(LogoSmall).props().showLogo).to.equal(false);
  });
});

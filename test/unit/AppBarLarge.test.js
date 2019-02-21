import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { shallowWithIntl } from './helpers/mock-intl-enzyme';

import AppBarLarge from '../../app/component/AppBarLarge';
import LogoSmall from '../../app/component/LogoSmall';

describe('<AppBarLarge />', () => {
  it('should show logo image', () => {
    const wrapper = shallowWithIntl(
      <AppBarLarge titleClicked={() => {}} logo="/" />,
      {
        context: {
          config: {
            textLogo: false,
          },
        },
      },
    );

    expect(wrapper.find('section.title')).to.have.lengthOf(0);
    expect(wrapper.find(LogoSmall).props().showLogo).to.equal(true);
  });

  it('should show text logo when textLogo is true', () => {
    const wrapper = shallowWithIntl(
      <AppBarLarge titleClicked={() => {}} logo="/" />,
      {
        context: {
          config: {
            textLogo: true,
          },
        },
      },
    );

    expect(wrapper.find('section.title')).to.have.lengthOf(1);
    expect(wrapper.find(LogoSmall).props().showLogo).to.equal(false);
  });
});

import React from 'react';
import PropTypes from 'prop-types';
import { expect } from 'chai';
import { describe, it } from 'mocha';

import { mockContext, mockChildContextTypes } from './helpers/mock-context';
import { mountWithIntl } from './helpers/mock-intl-enzyme';
import AppBarSmall from '../../app/component/AppBarSmall';
import AppBarLarge from '../../app/component/AppBarLarge';

describe('<AppBarSmall />', () => {
  it('should show logo image', () => {
    const wrapper = mountWithIntl(
      <AppBarSmall
        disableBackButton
        showLogo
        title="Reittiopas"
        homeUrl="/"
        logo="/"
      />,
      {
        context: {
          ...mockContext,
          config: {
            textLogo: false,
            mainMenu: {
              show: false,
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
          config: PropTypes.object,
        },
      },
    );
    expect(wrapper.find('.title span')).to.have.lengthOf(0);
  });

  it('should show text logo when textLogo is true', () => {
    const wrapper = mountWithIntl(
      <AppBarSmall
        disableBackButton
        showLogo
        title="Reittiopas"
        homeUrl="/"
        logo="/"
      />,
      {
        context: {
          ...mockContext,
          config: {
            textLogo: true,
            mainMenu: {
              show: false,
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
          config: PropTypes.object,
        },
      },
    );
    expect(wrapper.find('.title span')).to.have.lengthOf(1);
  });

  it('should show text logo when showLogo is false', () => {
    const wrapper = mountWithIntl(
      <AppBarSmall
        disableBackButton
        showLogo={false}
        title="Reittiopas"
        homeUrl="/"
        logo="/"
      />,
      {
        context: {
          ...mockContext,
          config: {
            textLogo: false,
            mainMenu: {
              show: true,
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
          config: PropTypes.object,
        },
      },
    );
    expect(wrapper.find('.title span')).to.have.lengthOf(1);
  });
});

describe('<AppBarLarge />', () => {
  it('should show logo image', () => {
    const wrapper = mountWithIntl(
      <AppBarLarge titleClicked={false} logo="/" />,
      {
        context: {
          ...mockContext,
          config: {
            textLogo: false,
            mainMenu: {
              show: true,
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
          config: PropTypes.object,
        },
      },
    );

    expect(wrapper.find('.title span')).to.have.lengthOf(0);
  });

  it('should show text logo when textLogo is true', () => {
    const wrapper = mountWithIntl(
      <AppBarLarge titleClicked={false} logo="/" />,
      {
        context: {
          ...mockContext,
          config: {
            textLogo: true,
            mainMenu: {
              show: true,
            },
          },
        },
        childContextTypes: {
          ...mockChildContextTypes,
          config: PropTypes.object,
        },
      },
    );

    expect(wrapper.find('.title span')).to.have.lengthOf(1);
  });
});

import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import PlatformNumber from '../../app/component/PlatformNumber';

describe('<PlatformNumber />', () => {
  it('should be empty if number is undefined', () => {
    const props = {
      short: false,
      isRailOrSubway: false,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper).to.be.empty;
  });

  it('should render message when isRailOrSubway is false', () => {
    const props = {
      number: '12',
      short: false,
      isRailOrSubway: false,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.find(FormattedMessage).props().id).to.equal('platform-num');
  });

  it('should render when isRailOrSubway is true', () => {
    const props = {
      number: '12',
      short: false,
      isRailOrSubway: true,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.find(FormattedMessage).props().id).to.equal('track-num');
  });

  it('should render shorter message when short is true', () => {
    const props = {
      number: '12',
      short: true,
      isRailOrSubway: false,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.find('span').props().className).to.equal('platform-short');
  });
});

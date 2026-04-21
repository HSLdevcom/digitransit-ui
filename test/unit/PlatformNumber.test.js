import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';
import PlatformNumber from '../../app/component/PlatformNumber';
import { TransportMode } from '../../app/constants';

describe('<PlatformNumber />', () => {
  it('should render nothing if number is undefined', () => {
    const props = {
      short: false,
      mode: TransportMode.Bus,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });

  it('should render platform text when mode is not RAIL or FERRY', () => {
    const props = {
      number: '12',
      short: false,
      mode: TransportMode.Bus,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.text()).to.include('Platform');
  });

  it('should render pier text when mode is FERRY', () => {
    const props = {
      number: '12',
      short: false,
      mode: TransportMode.Ferry,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.text()).to.include('Pier');
  });

  it('should render track text when mode is RAIL', () => {
    const props = {
      number: '12',
      short: false,
      mode: TransportMode.Rail,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.text()).to.include('Track');
  });

  it('should render short platform text when short is true', () => {
    const props = {
      number: '12',
      short: true,
      mode: TransportMode.Bus,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.text()).to.include('Plat.');
  });

  it('should use plain class on outer span when plain is true', () => {
    const props = {
      number: '12',
      short: false,
      mode: TransportMode.Bus,
      plain: true,
    };
    const wrapper = shallowWithIntl(<PlatformNumber {...props} />);
    expect(wrapper.hasClass('platform-number-plain')).to.equal(true);
    expect(wrapper.hasClass('platform-number')).to.equal(false);
  });
});

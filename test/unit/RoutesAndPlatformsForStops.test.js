import React from 'react';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallowWithIntl } from './helpers/mock-intl-enzyme';

import dt2715a from './test-data/dt2715a';
import dt2715b from './test-data/dt2715b';
import {
  mapRoutes,
  Component as RoutesAndPlatformsForStops,
} from '../../app/component/RoutesAndPlatformsForStops';

describe('<RoutesAndPlatformsForStops />', () => {
  it('should render a container successfully', () => {
    const props = {
      stop: dt2715a,
      stopType: 'terminal',
      terminalId: 'HSL:1000202',
    };
    const wrapper = shallowWithIntl(<RoutesAndPlatformsForStops {...props} />);

    expect(wrapper.find('.departure-list')).to.have.lengthOf(1);
  });
  it('should calculate the correct amount of unique departures', () => {
    const props = {
      stop: dt2715a,
      stopType: 'terminal',
      terminalId: 'HSL:1000202',
    };
    const sortedProps = mapRoutes(props.stop, props.stopType);

    expect(sortedProps.length).to.equal(27);
  });
  it('should render as many departures as it receives for a terminal', () => {
    const props = {
      stop: dt2715a,
      stopType: 'terminal',
      terminalId: 'HSL:1000202',
    };
    const wrapper = shallowWithIntl(<RoutesAndPlatformsForStops {...props} />);

    expect(wrapper.find('.departure')).to.have.lengthOf(
      mapRoutes(props.stop, props.stopType).length,
    );
  });
  it('should render as many departures as it receives for a stop', () => {
    const props = {
      stop: dt2715b,
      stopType: 'stop',
      terminalId: 'HSL:1173105',
    };
    const wrapper = shallowWithIntl(<RoutesAndPlatformsForStops {...props} />);

    expect(wrapper.find('.departure')).to.have.lengthOf(
      mapRoutes(props.stop, props.stopType).length,
    );
  });
});

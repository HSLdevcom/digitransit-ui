import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { Component as StopPageMap } from '../../../app/component/StopPageMap';

describe('<StopPageMap />', () => {
  it('should render empty if stop information is missing', () => {
    const props = {
      breakpoint: 'large',
      params: {
        stopId: 'HSL:2211275',
      },
      routes: [],
      stop: null,
    };
    const wrapper = shallowWithIntl(<StopPageMap {...props} />);
    expect(wrapper.isEmptyRender()).to.equal(true);
  });
});

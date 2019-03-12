import { expect } from 'chai';
import { describe, it } from 'mocha';
import React from 'react';

import { shallowWithIntl } from '../helpers/mock-intl-enzyme';
import { mockContext } from '../helpers/mock-context';
import { Component as RoutePatternSelect } from '../../../app/component/RoutePatternSelect';
import dt2887 from '../test-data/dt2887';
import dt2887b from '../test-data/dt2887b';

describe('<RoutePatternSelect />', () => {
  it('should render', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: { ...mockContext },
    });
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
  it('should create a select element for more than 2 patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('#select-route-pattern')).to.have.lengthOf(1);
  });
  it('should create a toggle element if there are only 2 patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887b} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('.route-patterns-toggle')).to.have.lengthOf(1);
  });
  it('should create as many options as there are patterns', () => {
    const wrapper = shallowWithIntl(<RoutePatternSelect {...dt2887} />, {
      context: { ...mockContext },
    });
    expect(wrapper.find('#select-route-pattern > option')).to.have.lengthOf(4);
  });
});

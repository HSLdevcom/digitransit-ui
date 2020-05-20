/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import Adapter from 'enzyme-adapter-react-16';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { shallow, configure } from 'enzyme';
import WithBreakpoint from '.';

configure({ adapter: new Adapter() });

describe('Testing @digitransit-component/digitransit-component-with-breakpoint module', () => {
  const wrapper = shallow(<WithBreakpoint />);

  it('should render', () => {
    expect(wrapper.isEmptyRender()).to.equal(false);
  });
});
